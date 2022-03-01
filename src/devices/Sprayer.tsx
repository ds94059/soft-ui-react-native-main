import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';
import { bleManager } from '../../App';

import { Block, Button, Image, Text, Switch, Modal, Input } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import { color } from 'react-native-reanimated';

const Sprayer = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [switch1, setSwitch1] = useState(false);
    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState('Michael');



    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    const handleSwitch = (switch1: boolean) => {
        setSwitch1(switch1);
        if (switch1)
            Alert.alert('Sprayer is looping...', 'Sprayer is set as 5s on/ 2s off.');
        else
            Alert.alert('Sprayer is not looping.', 'Sprayer loop is off.');
    }

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
                                {t('device.sprayer.title')}
                            </Text>
                        </Button>
                        <Block flex={0} align="center">
                            <Image
                                width={350}
                                height={350}
                                marginBottom={sizes.sm}
                                source={require('../assets/images/sprayer.png')}
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
                            <Block row justify="space-between" marginVertical={sizes.base} >
                                <Button
                                    flex={1}
                                    row
                                    gradient={gradients.dark}
                                    onPress={() => switch1 ? {} : setModal(true)}
                                    marginHorizontal={sizes.s}>
                                    <Block
                                        row
                                        align="center"
                                        justify="space-between"
                                        paddingHorizontal={sizes.sm}>
                                        <Text white bold marginRight={sizes.sm}>
                                            {quantity}
                                        </Text>
                                        <Image
                                            source={assets.arrow}
                                            color={colors.white}
                                            transform={[{ rotate: '90deg' }]}
                                        />
                                    </Block>
                                </Button>

                                <Button
                                    flex={0.05}
                                    row
                                    gradient={gradients.dark}
                                    onPress={() => navigation.navigate('Users')}
                                    marginHorizontal={sizes.s}>
                                    <Block
                                        row
                                        align="center"
                                        justify="center"
                                        paddingHorizontal={sizes.sm}>
                                        <Image
                                            source={assets.settings}
                                            color={colors.white}
                                        />
                                    </Block>
                                </Button>
                            </Block>
                            <Block row marginVertical={sizes.m}>
                                <Button
                                    white
                                    outlined
                                    shadow={false}
                                    radius={sizes.m}
                                    onPress={() => { handleSwitch(!switch1); }}>
                                    <Block
                                        row
                                        align="center"
                                        radius={sizes.m}
                                        paddingHorizontal={sizes.sm}
                                        color="rgba(255,255,255,0.2)">
                                        <Text white bold transform="uppercase">
                                            Sprayer Loop
                                        </Text>
                                        <Switch
                                            marginLeft={sizes.s}
                                            checked={switch1}
                                            onPress={() => { handleSwitch(!switch1) }}
                                        />
                                    </Block>
                                </Button>
                            </Block>
                        </Block>
                    </Image>
                </Block>
            </Block >
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={['Michael', 'Jason', 'Vinci', 'Luke', 'Justin', 'Evelyn']}
                    renderItem={({ item }) => (
                        <Button
                            marginBottom={sizes.sm}
                            onPress={() => {
                                setQuantity(item);
                                setModal(false);
                            }}>
                            <Text p white semibold>
                                {item}
                            </Text>
                        </Button>
                    )}
                />
            </Modal>

        </Block >
    );
};

export default Sprayer;

