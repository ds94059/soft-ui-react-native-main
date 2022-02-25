import React, { useCallback, useEffect } from 'react';
import { Linking, StatusBar, View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';

const Door = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    return (
        <Block safe marginTop={sizes.md}>
            <Block
                scroll
                paddingHorizontal={sizes.s}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.padding }}>
                <Block flex={0}>
                    <Image
                        background
                        resizeMode="cover"
                        padding={sizes.sm}
                        paddingBottom={sizes.l}
                        radius={sizes.cardRadius}
                        source={assets.background}>
                        <Button
                            row
                            flex={0}
                            justify="flex-start"
                            onPress={() => navigation.goBack()}>
                            <Image
                                radius={0}
                                width={10}
                                height={18}
                                color={colors.white}
                                source={assets.arrow}
                                transform={[{ rotate: '180deg' }]}
                            />
                            <Text p white marginLeft={sizes.s}>
                                {t('device.door.title')}
                            </Text>
                        </Button>
                        <Block flex={0} align="center">
                            <Image
                                width={300}
                                height={300}
                                marginBottom={sizes.sm}
                                source={require('../assets/images/sliding-door.png')}
                            />
                            <Block row marginVertical={sizes.m}>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    marginHorizontal={sizes.l}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}>
                                    <Ionicons
                                        size={18}
                                        name="remove"
                                        color={colors.white}
                                    />
                                </Button>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    marginHorizontal={sizes.l}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}>
                                    <Ionicons
                                        size={18}
                                        name="add"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                    </Image>
                </Block>
            </Block>
        </Block>
    );
};

export default Door;