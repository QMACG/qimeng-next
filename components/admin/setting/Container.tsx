'use client'

import { Tab, Tabs } from '@heroui/react'
import { DisableRegisterSetting } from './DisableRegisterSetting'
import { FrontDisplaySetting } from './FrontDisplaySetting'
import { HeaderNavSetting } from './HeaderNavSetting'
import { HomeAnnouncementSetting } from './HomeAnnouncementSetting'
import { RedirectSetting } from './RedirectSetting'
import { SiteAnalyticsSetting } from './SiteAnalyticsSetting'
import { UserNameStyleSetting } from './UserNameStyleSetting'
import type {
  AdminFrontDisplayConfig,
  AdminHeaderNavConfig,
  AdminHomeAnnouncementConfig,
  AdminRedirectConfig,
  AdminSiteAnalyticsScript,
  AdminUserNameStyleConfig
} from '~/types/api/admin'

interface Props {
  setting: AdminRedirectConfig
  disableRegister: boolean
  frontDisplay: AdminFrontDisplayConfig
  homeAnnouncement: AdminHomeAnnouncementConfig
  headerNav: AdminHeaderNavConfig
  siteAnalyticsScripts: AdminSiteAnalyticsScript[]
  userNameStyle: AdminUserNameStyleConfig
}

export const AdminSetting = ({
  setting,
  disableRegister,
  frontDisplay,
  homeAnnouncement,
  headerNav,
  siteAnalyticsScripts,
  userNameStyle
}: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">站点设置</h1>
      </div>

      <Tabs aria-label="站点设置" variant="underlined">
        <Tab key="front-display" title="前台显示">
          <FrontDisplaySetting setting={frontDisplay} />
        </Tab>

        <Tab key="home-announcement" title="公告管理">
          <HomeAnnouncementSetting setting={homeAnnouncement} />
        </Tab>

        <Tab key="header-nav" title="页头设置">
          <HeaderNavSetting config={headerNav} />
        </Tab>

        <Tab key="redirect" title="外链跳转">
          <RedirectSetting setting={setting} />
        </Tab>

        <Tab key="register" title="注册设置">
          <DisableRegisterSetting disableRegister={disableRegister} />
        </Tab>

        <Tab key="user-name-style" title="昵称配色">
          <UserNameStyleSetting config={userNameStyle} />
        </Tab>

        <Tab key="site-analytics" title="网站统计">
          <SiteAnalyticsSetting scripts={siteAnalyticsScripts} />
        </Tab>
      </Tabs>
    </div>
  )
}
