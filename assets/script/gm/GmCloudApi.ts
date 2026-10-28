/**
 * GM 云接口（Web Debug 专用）。
 *
 * 本文件位于 assets/script/gm/，微信构建前会被 scripts/strip-gm-code.js 整体剥离，
 * 微信产物中不包含任何调试接口路径与相关文案。
 * 仅在指向本地开发服务（zyx_api_base_override 生效）时允许调用，生产地址一律不同步。
 */
import { cloudService, isLocalApiOverrideActive } from '../manager/CloudService';
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import { uimanager } from '../manager/UIManager';

export type GmCloudHooks = {
    /** 用服务端返回的权威档案覆盖本地基准。 */
    applyServerProfile: (profile: any) => void;
    /** 确保已完成云端建档（拿到 token）。 */
    ensureCloudProfileReady: () => Promise<void>;
};

/** GM 发放后把开心豆/等级绝对值写回云端，避免下次 bootstrap/结算覆盖本地发放。 */
export async function pushDebugProfileToCloud(hooks: GmCloudHooks): Promise<void> {
    if (!isLocalApiOverrideActive()) {
        uimanager.showToast('仅本地调试，未同步云端');
        return;
    }
    try {
        await hooks.ensureCloudProfileReady();
        const data = await cloudService.postAuthenticated('/debug/profile', {
            moodBeanBalance: zyxGameModule.moodBeanBalance,
            totalMoodBeans: zyxGameModule.moodBeanBalance,
            level: zyxGameModule.level,
            experience: zyxGameModule.experience,
            highestSingleGameScore: zyxGameModule.bestScore,
        });
        hooks.applyServerProfile(data.profile);
    } catch (error) {
        uimanager.showToast('本地已保存，云端同步失败');
    }
}

/** GM：清空本地账号进度；仅指向本地开发服务时同步重置云端，生产地址只重置本地。 */
export async function resetCloudAccount(
    hooks: GmCloudHooks & { refreshInventoryDisplays: () => void },
): Promise<void> {
    zyxGameModule.resetLocalAccount();
    hooks.refreshInventoryDisplays();
    if (!isLocalApiOverrideActive()) {
        uimanager.showToast('本地已重置（仅本地调试，未同步云端）');
        return;
    }
    try {
        await hooks.ensureCloudProfileReady();
        const data = await cloudService.postAuthenticated('/debug/reset', {});
        hooks.applyServerProfile(data.profile);
        uimanager.showToast('账号已重置');
    } catch (error) {
        uimanager.showToast('本地已重置，云端同步失败');
    }
}
