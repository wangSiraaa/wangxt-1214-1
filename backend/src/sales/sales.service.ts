import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SaleOrder, SaleOrderDocument, SaleOrderStatus, CascadePurpose } from './schemas/sale-order.schema';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto } from './dto/sale-order.dto';
import { BatteryService } from '../battery/battery.service';
import { BatteryStatus, SafetyLevel } from '../battery/schemas/battery.schema';
import { FlowEventType } from '../flow/schemas/flow-event.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(SaleOrder.name) private saleOrderModel: Model<SaleOrderDocument>,
    @Inject(forwardRef(() => BatteryService))
    private batteryService: BatteryService,
  ) {}

  async create(dto: CreateSaleOrderDto, operator: string): Promise<SaleOrderDocument> {
    const batteries = [];
    const batteryList = [];

    for (const batteryId of dto.batteryIds) {
      const battery = await this.batteryService.findById(batteryId);

      if (battery.status !== BatteryStatus.QUALIFIED && battery.status !== BatteryStatus.FOR_SALE) {
        throw new BadRequestException(
          `电池包 ${battery.batteryCode} 状态为 ${battery.status}，不可用于销售`,
        );
      }

      if (!battery.safetyLevel || !this.isSafetyQualified(battery.safetyLevel as SafetyLevel)) {
        throw new BadRequestException(
          `电池包 ${battery.batteryCode} 安全等级为 ${battery.safetyLevel}，不达标，不能进行梯次利用销售`,
        );
      }

      if (!this.isPurposeAllowedForSafetyLevel(dto.cascadePurpose, battery.safetyLevel as SafetyLevel)) {
        throw new BadRequestException(
          `电池包 ${battery.batteryCode} 安全等级为 ${battery.safetyLevel}，不适用于梯次用途：${dto.cascadePurpose}`,
        );
      }

      batteries.push(battery);
      batteryList.push({
        batteryCode: battery.batteryCode,
        capacity: battery.capacity,
        safetyLevel: battery.safetyLevel,
      });
    }

    const orderNo = this.generateOrderNo();

    const saleOrder = new this.saleOrderModel({
      ...dto,
      orderNo,
      batteryIds: dto.batteryIds.map(id => new Types.ObjectId(id)),
      batteryList,
      totalQuantity: batteryList.length,
      saleDate: dto.saleDate || new Date(),
      status: SaleOrderStatus.DRAFT,
    });

    return saleOrder.save();
  }

  async confirm(orderId: string, operator: string): Promise<SaleOrderDocument> {
    const order = await this.findById(orderId);

    if (order.status !== SaleOrderStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的订单可以确认');
    }

    for (const batteryId of order.batteryIds) {
      const battery = await this.batteryService.findById(batteryId.toString());

      if (battery.isInspectionLocked) {
        throw new BadRequestException(
          `电池包 ${battery.batteryCode} 已锁定，无法确认销售`,
        );
      }

      if (battery.status !== BatteryStatus.QUALIFIED && battery.status !== BatteryStatus.FOR_SALE) {
        throw new BadRequestException(
          `电池包 ${battery.batteryCode} 状态异常，无法确认销售`,
        );
      }

      await this.batteryService.updateStatus(
        batteryId.toString(),
        BatteryStatus.SOLD,
        operator,
        FlowEventType.SOLD,
        `销售订单 ${order.orderNo} 确认`,
        {
          isInspectionLocked: true,
          cascadePurpose: order.cascadePurpose,
          customerName: order.customerName,
          salesPerson: order.salesPerson,
          saleDate: new Date(),
        },
      );
    }

    order.status = SaleOrderStatus.CONFIRMED;
    return order.save();
  }

  async ship(orderId: string, operator: string): Promise<SaleOrderDocument> {
    const order = await this.findById(orderId);

    if (order.status !== SaleOrderStatus.CONFIRMED) {
      throw new BadRequestException('只有已确认的订单可以发货');
    }

    for (const batteryId of order.batteryIds) {
      await this.batteryService.updateStatus(
        batteryId.toString(),
        BatteryStatus.SHIPPED,
        operator,
        FlowEventType.SHIPPED,
        `销售订单 ${order.orderNo} 发货`,
      );
    }

    order.status = SaleOrderStatus.SHIPPED;
    order.shippingDate = new Date();
    return order.save();
  }

  async complete(orderId: string, operator: string): Promise<SaleOrderDocument> {
    const order = await this.findById(orderId);

    if (order.status !== SaleOrderStatus.SHIPPED) {
      throw new BadRequestException('只有已发货的订单可以完成');
    }

    order.status = SaleOrderStatus.COMPLETED;
    return order.save();
  }

  async cancel(orderId: string, operator: string): Promise<SaleOrderDocument> {
    const order = await this.findById(orderId);

    if (order.status === SaleOrderStatus.COMPLETED || order.status === SaleOrderStatus.CANCELLED) {
      throw new BadRequestException('该订单状态不能取消');
    }

    if (order.status === SaleOrderStatus.CONFIRMED || order.status === SaleOrderStatus.SHIPPED) {
      for (const batteryId of order.batteryIds) {
        const battery = await this.batteryService.findById(batteryId.toString());
        await this.batteryService.updateStatus(
          batteryId.toString(),
          BatteryStatus.QUALIFIED,
          operator,
          FlowEventType.MODIFY,
          `销售订单 ${order.orderNo} 取消，退回待售`,
          {
            isInspectionLocked: false,
          },
        );
      }
    }

    order.status = SaleOrderStatus.CANCELLED;
    return order.save();
  }

  async findById(id: string): Promise<SaleOrderDocument> {
    const order = await this.saleOrderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('销售订单不存在');
    }
    return order;
  }

  async findAll(query: QuerySaleOrderDto): Promise<{ list: SaleOrderDocument[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = query;
    const mongoQuery: any = {};

    if (filters.orderNo) {
      mongoQuery.orderNo = { $regex: filters.orderNo, $options: 'i' };
    }
    if (filters.customerName) {
      mongoQuery.customerName = { $regex: filters.customerName, $options: 'i' };
    }
    if (filters.status) {
      mongoQuery.status = filters.status;
    }
    if (filters.cascadePurpose) {
      mongoQuery.cascadePurpose = filters.cascadePurpose;
    }
    if (filters.salesPerson) {
      mongoQuery.salesPerson = { $regex: filters.salesPerson, $options: 'i' };
    }

    const [list, total] = await Promise.all([
      this.saleOrderModel
        .find(mongoQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.saleOrderModel.countDocuments(mongoQuery).exec(),
    ]);

    return { list, total };
  }

  async update(id: string, dto: UpdateSaleOrderDto, operator: string): Promise<SaleOrderDocument> {
    const order = await this.findById(id);

    if (order.status !== SaleOrderStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的订单可以修改');
    }

    if (dto.batteryIds && dto.batteryIds.length > 0) {
      const batteryList = [];
      for (const batteryId of dto.batteryIds) {
        const battery = await this.batteryService.findById(batteryId);

        if (battery.status !== BatteryStatus.QUALIFIED && battery.status !== BatteryStatus.FOR_SALE) {
          throw new BadRequestException(
            `电池包 ${battery.batteryCode} 状态为 ${battery.status}，不可用于销售`,
          );
        }

        if (!battery.safetyLevel || !this.isSafetyQualified(battery.safetyLevel as SafetyLevel)) {
          throw new BadRequestException(
            `电池包 ${battery.batteryCode} 安全等级不达标，不能进行梯次利用销售`,
          );
        }

        batteryList.push({
          batteryCode: battery.batteryCode,
          capacity: battery.capacity,
          safetyLevel: battery.safetyLevel,
        });
      }
      order.batteryIds = dto.batteryIds.map(id => new Types.ObjectId(id));
      order.batteryList = batteryList;
      order.totalQuantity = batteryList.length;
    }

    if (dto.cascadePurpose && order.batteryIds.length > 0) {
      for (const batteryId of order.batteryIds) {
        const battery = await this.batteryService.findById(batteryId.toString());
        if (!this.isPurposeAllowedForSafetyLevel(dto.cascadePurpose, battery.safetyLevel as SafetyLevel)) {
          throw new BadRequestException(
            `电池包 ${battery.batteryCode} 安全等级为 ${battery.safetyLevel}，不适用于梯次用途：${dto.cascadePurpose}`,
          );
        }
      }
    }

    if (dto.customerName) order.customerName = dto.customerName;
    if (dto.customerContact) order.customerContact = dto.customerContact;
    if (dto.customerPhone) order.customerPhone = dto.customerPhone;
    if (dto.customerAddress) order.customerAddress = dto.customerAddress;
    if (dto.cascadePurpose) order.cascadePurpose = dto.cascadePurpose;
    if (dto.totalAmount !== undefined) order.totalAmount = dto.totalAmount;
    if (dto.remark !== undefined) order.remark = dto.remark;
    if (dto.shippingAddress) order.shippingAddress = dto.shippingAddress;

    return order.save();
  }

  async getAvailableBatteries(): Promise<any[]> {
    const result = await this.batteryService.findAll({
      page: 1,
      pageSize: 1000,
      status: BatteryStatus.QUALIFIED,
    });

    return result.list.filter(b => b.safetyLevel && this.isSafetyQualified(b.safetyLevel as SafetyLevel));
  }

  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SO${dateStr}${random}`;
  }

  private isSafetyQualified(safetyLevel: SafetyLevel): boolean {
    return safetyLevel === SafetyLevel.A || safetyLevel === SafetyLevel.B;
  }

  private isPurposeAllowedForSafetyLevel(purpose: CascadePurpose, safetyLevel: SafetyLevel): boolean {
    if (safetyLevel === SafetyLevel.A) {
      return true;
    }

    if (safetyLevel === SafetyLevel.B) {
      const allowedPurposes = [
        CascadePurpose.LOW_SPEED_EV,
        CascadePurpose.COMMUNICATION_BASE,
        CascadePurpose.UPS,
        CascadePurpose.SOLAR_STREET_LAMP,
        CascadePurpose.OTHER,
      ];
      return allowedPurposes.includes(purpose);
    }

    return false;
  }

  getCascadePurposes(): { value: string; label: string; description: string }[] {
    return [
      { value: CascadePurpose.ENERGY_STORAGE, label: '储能电站', description: '电网储能、风光储一体化等' },
      { value: CascadePurpose.LOW_SPEED_EV, label: '低速电动车', description: '电动自行车、低速电动汽车等' },
      { value: CascadePurpose.COMMUNICATION_BASE, label: '基站备电', description: '通信基站备用电源' },
      { value: CascadePurpose.UPS, label: 'UPS电源', description: '不间断电源系统' },
      { value: CascadePurpose.SOLAR_STREET_LAMP, label: '太阳能路灯', description: '光伏路灯储能' },
      { value: CascadePurpose.OTHER, label: '其他', description: '其他梯次利用场景' },
    ];
  }
}
