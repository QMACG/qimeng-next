import { prisma } from '~/prisma/index'
import type { AdminUserNameStyleConfig } from '~/types/api/admin'

export const DEFAULT_USER_NAME_STYLE_CONFIG: AdminUserNameStyleConfig = {
  role1Color: '#a1a1aa',
  role2Color: '#2563eb',
  role3Color: '#d97706',
  role4Color: '#dc2626'
}

const mapConfig = (config: {
  role_1_color: string
  role_2_color: string
  role_3_color: string
  role_4_color: string
}): AdminUserNameStyleConfig => ({
  role1Color: config.role_1_color,
  role2Color: config.role_2_color,
  role3Color: config.role_3_color,
  role4Color: config.role_4_color
})

export const getUserNameStyleConfig =
  async (): Promise<AdminUserNameStyleConfig> => {
    const config = await (prisma as any).site_user_name_style_config.findUnique(
      {
        where: { id: 1 }
      }
    )

    if (!config) {
      const created = await (prisma as any).site_user_name_style_config.create({
        data: {
          id: 1,
          role_1_color: DEFAULT_USER_NAME_STYLE_CONFIG.role1Color,
          role_2_color: DEFAULT_USER_NAME_STYLE_CONFIG.role2Color,
          role_3_color: DEFAULT_USER_NAME_STYLE_CONFIG.role3Color,
          role_4_color: DEFAULT_USER_NAME_STYLE_CONFIG.role4Color
        }
      })

      return mapConfig(created)
    }

    return mapConfig(config)
  }
