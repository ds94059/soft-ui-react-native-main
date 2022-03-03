import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import * as RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal, Input } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import { userConfig } from '../devices/Sprayer';
import { toNumber } from 'i18n-js';

const Users = () => {
    const { users } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState(userConfig.users[0].name);
    const [userData, setuserData] = useState([userConfig.users[0].name]);
    const [onTime, setonTime] = useState(userConfig.users[0].onTime);
    const [offTime, setoffTime] = useState(userConfig.users[0].offTime);

    const imgData = [
        { uri: users[0].avatar },
        { uri: users[5].avatar },
        { uri: users[2].avatar },
        { uri: users[3].avatar },
        { uri: users[4].avatar },
        { uri: users[5].avatar },
    ]
    const [selectedIdx, setIdx] = useState(0);
    const [imageSrc, setImageSrc] = useState(imgData[0]);

    const initData = () => {
        console.log(userConfig);
        while (userData.length > 0) {
            userData.pop();
        }

        userConfig.users.forEach((user: any) => {
            userData.push(user.name);
        })
        console.log(userData);
    }

    const handleEditonTime = (time: number) => {
        setonTime(time);
        userConfig.users[selectedIdx].onTime = time;
        handleSave();
    }

    const handleEditoffTime = (time: number) => {
        setoffTime(time);
        userConfig.users[selectedIdx].offTime = time;
        handleSave();
    }

    const handleSave = () => {
        // const path = '/storage/emulated/0/Download/data.json';
        const path = RNFS.DocumentDirectoryPath + '/data.json';

        RNFS.writeFile(path, JSON.stringify(userConfig), 'utf8')
            .then((success) => {
                console.log('FILE WRITTEN!');
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    useEffect(() => {
        initData();
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
                                {t('device.sprayer.setting.title')}
                            </Text>
                        </Button>
                        <Block flex={0} align="center">
                            <Image
                                width={300}
                                height={300}
                                marginBottom={sizes.sm}
                                source={imageSrc}
                            />
                            <Block row marginVertical={sizes.m}>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}
                                    onPress={() => {
                                        if (selectedIdx > 0) {
                                            setIdx(selectedIdx - 1);
                                            setQuantity(userData[selectedIdx - 1]);
                                            setImageSrc(imgData[selectedIdx - 1]);
                                            setonTime(userConfig.users[selectedIdx - 1].onTime);
                                            setoffTime(userConfig.users[selectedIdx - 1].offTime);
                                        }
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-back-sharp"
                                        color={colors.white}
                                    />
                                </Button>

                                <Button
                                    flex={1}
                                    row
                                    gradient={gradients.dark}
                                    onPress={() => setModal(true)}
                                    onLongPress={() => console.log("longpress")}
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
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}
                                    onPress={() => {
                                        if (selectedIdx < userData.length - 1) {
                                            setIdx(selectedIdx + 1);
                                            setQuantity(userData[selectedIdx + 1]);
                                            setImageSrc(imgData[selectedIdx + 1]);
                                            setonTime(userConfig.users[selectedIdx + 1].onTime);
                                            setoffTime(userConfig.users[selectedIdx + 1].offTime);
                                        }
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-forward-sharp"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                        <Block row align="center" justify="center">
                            <Block flex={0.3}>
                                <Input white placeholder="0~9" marginBottom={sizes.sm} textAlign="center" defaultValue={onTime.toString()} onEndEditing={(e) => { handleEditonTime(Number(e.nativeEvent.text)) }} />
                            </Block>
                            <Text white bold marginHorizontal={sizes.s}>s     On</Text>
                        </Block>
                        <Block row align="center" justify="center">
                            <Block flex={0.3}>
                                <Input white placeholder="0~9" marginBottom={sizes.sm} textAlign="center" defaultValue={offTime.toString()} onEndEditing={(e) => { handleEditoffTime(Number(e.nativeEvent.text)) }} />
                            </Block>
                            <Text white bold marginHorizontal={sizes.s}>s     Off</Text>
                        </Block>
                        {/* <Block align='flex-end'>
                            <Button
                                shadow={false}
                                radius={sizes.m}
                                color="rgba(255,255,255,0.3)"
                                //outlined={String(colors.white)}
                                onPress={() => { handleSave(); }}>
                                <Ionicons
                                    size={36}
                                    name="ios-checkmark"
                                    color={colors.white}
                                />
                            </Button>
                        </Block> */}
                    </Image>
                </Block>
            </Block >
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={userData}
                    renderItem={({ item, index }) => (
                        <Button
                            marginBottom={sizes.sm}
                            onPress={() => {
                                setIdx(index);
                                setQuantity(item);
                                setModal(false);
                                setImageSrc(imgData[index]);
                                setonTime(userConfig.users[index].onTime);
                                setoffTime(userConfig.users[index].offTime);
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

export default Users;