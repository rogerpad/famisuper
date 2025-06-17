import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserPermissionsService } from '../services/user-permissions.service';
import { Permiso } from '../entities/permiso.entity';

@ApiTags('user-permissions')
@Controller('user-permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserPermissionsController {
  constructor(private readonly userPermissionsService: UserPermissionsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener los permisos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de permisos del usuario' })
  async getCurrentUserPermissions(@Request() req): Promise<Permiso[]> {
    const userId = req.user.sub;
    return this.userPermissionsService.getUserPermissions(userId);
  }

  @Get('me/map')
  @ApiOperation({ summary: 'Obtener mapa de permisos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Mapa de permisos del usuario' })
  async getCurrentUserPermissionsMap(@Request() req): Promise<Record<string, boolean>> {
    const userId = req.user.sub;
    return this.userPermissionsService.getUserPermissionsMap(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener los permisos de un usuario por su ID' })
  @ApiResponse({ status: 200, description: 'Lista de permisos del usuario' })
  async getUserPermissions(@Param('userId') userId: number): Promise<Permiso[]> {
    return this.userPermissionsService.getUserPermissions(userId);
  }

  @Get('check/:permisoCode')
  @ApiOperation({ summary: 'Verificar si el usuario autenticado tiene un permiso específico' })
  @ApiResponse({ status: 200, description: 'True si tiene el permiso, false si no' })
  async checkPermission(
    @Request() req,
    @Param('permisoCode') permisoCode: string,
  ): Promise<{ hasPermission: boolean }> {
    const userId = req.user.sub;
    const hasPermission = await this.userPermissionsService.hasPermission(userId, permisoCode);
    return { hasPermission };
  }
}
