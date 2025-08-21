import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneLine } from './entities/phone-line.entity';
import { CreatePhoneLineDto } from './dto/create-phone-line.dto';
import { UpdatePhoneLineDto } from './dto/update-phone-line.dto';

@Injectable()
export class PhoneLinesService {
  constructor(
    @InjectRepository(PhoneLine)
    private phoneLinesRepository: Repository<PhoneLine>,
  ) {}

  async create(createPhoneLineDto: CreatePhoneLineDto): Promise<PhoneLine> {
    const phoneLine = this.phoneLinesRepository.create(createPhoneLineDto);
    return this.phoneLinesRepository.save(phoneLine);
  }

  async findAll(): Promise<PhoneLine[]> {
    return this.phoneLinesRepository.find();
  }

  async findActive(): Promise<PhoneLine[]> {
    return this.phoneLinesRepository.find({ where: { activo: true } });
  }

  async findOne(id: number): Promise<PhoneLine> {
    const phoneLine = await this.phoneLinesRepository.findOne({ where: { id } });
    if (!phoneLine) {
      throw new NotFoundException(`Línea telefónica con ID ${id} no encontrada`);
    }
    return phoneLine;
  }

  async update(id: number, updatePhoneLineDto: UpdatePhoneLineDto): Promise<PhoneLine> {
    const phoneLine = await this.findOne(id);
    this.phoneLinesRepository.merge(phoneLine, updatePhoneLineDto);
    return this.phoneLinesRepository.save(phoneLine);
  }

  async remove(id: number): Promise<void> {
    const phoneLine = await this.findOne(id);
    await this.phoneLinesRepository.remove(phoneLine);
  }
}
