import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodsRepository: Repository<PaymentMethod>,
  ) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = this.paymentMethodsRepository.create({
      ...createPaymentMethodDto,
    });
    return this.paymentMethodsRepository.save(paymentMethod);
  }

  async findAll(onlyActive: boolean = false): Promise<PaymentMethod[]> {
    if (onlyActive) {
      return this.paymentMethodsRepository.find({
        where: { activo: true },
        order: { nombre: 'ASC' },
      });
    }
    return this.paymentMethodsRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodsRepository.findOne({
      where: { id },
    });
    
    if (!paymentMethod) {
      throw new NotFoundException(`Forma de pago con ID ${id} no encontrada`);
    }
    
    return paymentMethod;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    
    Object.assign(paymentMethod, {
      ...updatePaymentMethodDto,
    });
    
    return this.paymentMethodsRepository.save(paymentMethod);
  }

  async remove(id: number): Promise<void> {
    const paymentMethod = await this.findOne(id);
    await this.paymentMethodsRepository.remove(paymentMethod);
  }

  async toggleActive(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id);
    paymentMethod.activo = !paymentMethod.activo;
    return this.paymentMethodsRepository.save(paymentMethod);
  }
}
