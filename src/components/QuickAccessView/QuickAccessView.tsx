import {
    PanelSection,
    PanelSectionRow,
    ButtonItem,
    Router,
    DropdownItem,
    ToggleField,
    Field,
} from '@decky/ui';
import { useEffect, useState } from 'react';
import {
    clearCache,
    hideDetailsKey,
    statPreferencesKey,
    styleKey,
    updateCache,
} from '../../hooks/Cache';
import { usePreference, useStyle } from '../../hooks/useStyle';
import { useStatPreferences } from '../../hooks/useStatPreferences';
import useLocalization from '../../hooks/useLocalization';
import { checkHltbTroubleshootingStatus } from '../../hooks/HltbApi';

interface TroubleshootingValues {
    hltb: string;
    endpoint: string;
    auth: string;
}

export const QuickAccessView = () => {
    const handleClearCache = () => {
        clearCache();
        Router.CloseSideMenus();
    };
    const style = useStyle();
    // probably overkill for something so simple but it's fine :)
    const hideDetails = usePreference();

    const preferences = useStatPreferences();

    const lang = useLocalization();
    const [troubleshootingValues, setTroubleshootingValues] =
        useState<TroubleshootingValues>({
            hltb: lang('troubleshootingChecking'),
            endpoint: lang('troubleshootingChecking'),
            auth: lang('troubleshootingChecking'),
        });

    const styleOptions = [
        { data: 0, label: lang('default'), value: 'default' },
        { data: 1, label: lang('clean'), value: 'clean' },
        { data: 2, label: lang('cleanLeft'), value: 'clean-left' },
        { data: 3, label: lang('cleanDefault'), value: 'clean-default' },
    ] as const;

    const toggleShowMain = () => {
        preferences.showMain = !preferences.showMain;
        updateCache(statPreferencesKey, preferences);
    };

    const toggleShowMainPlus = () => {
        preferences.showMainPlus = !preferences.showMainPlus;
        updateCache(statPreferencesKey, preferences);
    };

    const toggleShowComplete = () => {
        preferences.showComplete = !preferences.showComplete;
        updateCache(statPreferencesKey, preferences);
    };

    const toggleShowAllStyles = () => {
        preferences.showAllStyles = !preferences.showAllStyles;
        updateCache(statPreferencesKey, preferences);
    };

    useEffect(() => {
        let cancelled = false;

        const loadTroubleshootingValues = async () => {
            const status = await checkHltbTroubleshootingStatus();
            if (cancelled) {
                return;
            }

            setTroubleshootingValues({
                hltb:
                    status.hltb === 'reachable'
                        ? lang('troubleshootingReachable')
                        : lang('troubleshootingBroken'),
                endpoint: status.endpoint || lang('troubleshootingUnknown'),
                auth:
                    status.auth === 'ready'
                        ? lang('troubleshootingReady')
                        : lang('troubleshootingFailed'),
            });
        };

        loadTroubleshootingValues().catch((error) => {
            console.error('HLTB - troubleshooting status failed:', error);
            if (!cancelled) {
                setTroubleshootingValues({
                    hltb: lang('troubleshootingBroken'),
                    endpoint: lang('troubleshootingUnknown'),
                    auth: lang('troubleshootingFailed'),
                });
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <PanelSection>
                <PanelSectionRow>
                    <DropdownItem
                        label={lang('hltbStyle')}
                        description={lang('cleanDesc')}
                        menuLabel={lang('hltbStyle')}
                        rgOptions={styleOptions.map((o) => ({
                            data: o.data,
                            label: o.label,
                        }))}
                        selectedOption={
                            styleOptions.find((o) => o.value === style)?.data ||
                            0
                        }
                        onChange={(newVal: { data: number; label: string }) => {
                            const newStyle =
                                styleOptions.find((o) => o.data === newVal.data)
                                    ?.value || 'default';
                            updateCache(styleKey, newStyle);
                        }}
                    />
                </PanelSectionRow>
                <PanelSectionRow>
                    <ToggleField
                        label={lang('hideViewDetails')}
                        description={lang('hideViewDetailsDesc')}
                        checked={hideDetails}
                        onChange={(checked) =>
                            updateCache(hideDetailsKey, checked)
                        }
                    />
                </PanelSectionRow>
                <PanelSectionRow>
                    <ToggleField
                        label={lang('toggleMainStat')}
                        description={lang('toggleMainStatDesc')}
                        checked={preferences.showMain}
                        onChange={() => toggleShowMain()}
                    />
                </PanelSectionRow>
                <PanelSectionRow>
                    <ToggleField
                        label={lang('toggleMainPlusStat')}
                        description={lang('toggleMainPlusStatDesc')}
                        checked={preferences.showMainPlus}
                        onChange={() => toggleShowMainPlus()}
                    />
                </PanelSectionRow>
                <PanelSectionRow>
                    <ToggleField
                        label={lang('toggleCompletionistStat')}
                        description={lang('toggleCompletionistStatDesc')}
                        checked={preferences.showComplete}
                        onChange={() => toggleShowComplete()}
                    />
                </PanelSectionRow>
                <PanelSectionRow>
                    <ToggleField
                        label={lang('toggleAllPlayStylesStat')}
                        description={lang('toggleAllPlayStylesStatDesc')}
                        checked={preferences.showAllStyles}
                        onChange={() => toggleShowAllStyles()}
                    />
                </PanelSectionRow>
            </PanelSection>
            <PanelSection title={lang('troubleshooting')}>
                <PanelSectionRow>
                    <ButtonItem layout="below" onClick={handleClearCache}>
                        {lang('clearCache')}
                    </ButtonItem>
                </PanelSectionRow>
                <PanelSectionRow>
                    <Field
                        focusable
                        disabled
                        label={lang('troubleshootingHltb')}
                    >
                        {troubleshootingValues.hltb}
                    </Field>
                </PanelSectionRow>
                <PanelSectionRow>
                    <Field
                        focusable
                        disabled
                        label={lang('troubleshootingEndpoint')}
                    >
                        {troubleshootingValues.endpoint}
                    </Field>
                </PanelSectionRow>
                <PanelSectionRow>
                    <Field
                        focusable
                        disabled
                        label={lang('troubleshootingAuth')}
                    >
                        {troubleshootingValues.auth}
                    </Field>
                </PanelSectionRow>
                <PanelSectionRow>
                    <Field
                        focusable
                        disabled
                        label={lang('troubleshootingPlugin')}
                    >
                        {lang('troubleshootingReady')}
                    </Field>
                </PanelSectionRow>
            </PanelSection>
        </>
    );
};
