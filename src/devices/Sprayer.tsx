import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, Alert, FlatList, PermissionsAndroid, TouchableOpacity, Pressable, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
global.Buffer = global.Buffer || require('buffer').Buffer

import { Block, Button, Image, Text, Switch, Modal, Input } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import { color } from 'react-native-reanimated';
import { bleManager, sprayer } from '../screens/Home';

export let userConfig: any;

// define writing service id
const SERVICE_ID = "19B10000-E8F2-537E-4F6C-D104768A1214";
const WRITE_BYTE_CHAR_ID = "19B10001-E8F2-537E-4F6C-D104768A1214";
const WRITE_STRING_CHAR_ID = "19B10001-E8F2-537E-4F6C-D104768A1215";
let READ_SERVICE_ID = "";
let READ_CHAR_ID = "";

let loopId: NodeJS.Timeout;

// request storage permission
const requestStoragePermission = async () => {
    if (Platform.OS == 'ios')
        return
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
                title: "Cool BLE App Storage Request",
                message:
                    "Cool BLE App needs access to your storage " +
                    "so you can custom your user config.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Read permission ok.");

            const grant = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Cool BLE App Storage Request",
                    message:
                        "Cool BLE App needs access to your storage " +
                        "so you can custom your user config.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (grant === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Write permission ok.");

            } else {
                console.log("Storage permission denied");
            }
        } else {
            console.log("Storage permission denied");
        }

    } catch (err) {
        console.warn(err);
    }
};

const Sprayer = () => {
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [switch1, setSwitch1] = useState(false);
    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState("");
    const [userData, setUserData] = useState([""]);
    const [selectedIdx, setIndex] = useState(0);
    const [brightness, setBrightness] = useState(0);
    const [sprayerSrc, setSprayerSrc] = useState(require('../assets/images/sprayer.png'));
    const { users } = useData();

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    useEffect(() => {
        const fetchDevice = async () => {
            await requestStoragePermission();
            fetchUserData();
        }
        clearInterval(loopId);
        if (isFocused) {
            fetchDevice().catch(console.error);
        }
    }, [isFocused]);

    const initData = () => {
        while (userData.length > 0) {
            userData.pop();
        }

        userConfig.users.forEach((user: any) => {
            userData.push(user.name);
        })
        if (userData.length == 0)
            setQuantity("");
        else
            setQuantity(userConfig.users[0].name);
    }

    const setDefaultUsers = () => {
        const data = {
            users: [{
                id: 0,
                name: "Michael",
                onTime: 5,
                offTime: 2,
                imageSrc: { uri: users[0].avatar }
            },
            {
                id: 1,
                name: "Jason",
                onTime: 3,
                offTime: 1,
                imageSrc: { uri: users[5].avatar }
            },
            {
                id: 2,
                name: "Vinci",
                onTime: 2,
                offTime: 2,
                imageSrc: { uri: users[2].avatar }
            }]
        };
        const path = RNFS.DocumentDirectoryPath + '/data.json';
        userConfig = data;
        initData();
        RNFS.writeFile(path, JSON.stringify(data), 'utf8')
            .then((success) => {
                console.log('FILE WRITTEN!');
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    const fetchUserData = async () => {
        // const path = '/storage/emulated/0/Download/data.json';
        const path = RNFS.DocumentDirectoryPath + '/data.json';
        const exist = await RNFS.exists(path);
        if (exist) {
            RNFS.readFile(path, 'ascii')
                .then((res) => {
                    const data = JSON.parse(res);
                    userConfig = data;
                    initData();
                })
                .catch((err) => {
                    console.log(err.message, err.code);
                });
        }
        else {
            const data = {
                users: [{
                    id: 0,
                    name: "Michael",
                    onTime: 5,
                    offTime: 2,
                    imageSrc: { uri: users[0].avatar }
                },
                {
                    id: 1,
                    name: "Jason",
                    onTime: 3,
                    offTime: 1,
                    imageSrc: { uri: users[5].avatar }
                },
                {
                    id: 2,
                    name: "Vinci",
                    onTime: 2,
                    offTime: 2,
                    imageSrc: { uri: users[2].avatar }
                }]
            };
            userConfig = data;
            initData();
            RNFS.writeFile(path, JSON.stringify(data), 'utf8')
                .then((success) => {
                    console.log('FILE WRITTEN!');
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
    }

    const handleSwitch = async (switch1: boolean) => {
        setSwitch1(switch1);

        // get service and characteristic id
        try {
            const services = await sprayer.services();
            for (const service of services) {
                const characteristics = await service.characteristics();
                for (const characteristic of characteristics) {
                    if (characteristic.isReadable) {
                        // get read service id
                        READ_SERVICE_ID = service.uuid;
                        READ_CHAR_ID = characteristic.uuid;
                        console.log("readServiceId: ", READ_SERVICE_ID);
                        console.log("readCharId", READ_CHAR_ID);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
        let formatValue;

        if (switch1) {
            const onTime = userConfig.users[selectedIdx].onTime, offTime = userConfig.users[selectedIdx].offTime;
            loopSprayerPicture(true, onTime, offTime);
            try {
                writeData(onTime, offTime, SERVICE_ID, WRITE_BYTE_CHAR_ID);
                Alert.alert('Sprayer is looping...', 'Sprayer is set as ' + userConfig.users[selectedIdx].onTime + 's on/ ' + userConfig.users[selectedIdx].offTime + 's off.');
            } catch (error) {
                console.error(error);
            }

        }
        else {
            loopSprayerPicture(false);
            formatValue = Buffer.from("B").toString("base64");
            bleManager.writeCharacteristicWithResponseForDevice(
                sprayer.id,
                SERVICE_ID,
                WRITE_BYTE_CHAR_ID,
                formatValue
            )
            Alert.alert('Sprayer is not looping.', 'Sprayer loop is off.');
        }
    }

    const loopSprayerPicture = async (trigger: boolean, onTime?: number, offTime?: number) => {
        if (trigger && onTime && offTime) {
            const loop = function () {
                let timeoutId: NodeJS.Timeout;
                const loop2 = function () {
                    setSprayerSrc(require('../assets/images/sprayer_1.png'));
                    timeoutId = setTimeout(() => { setSprayerSrc(require('../assets/images/sprayer_2.png')) }, 500);
                    return loop2;
                }
                const loopId2 = setInterval(loop2(), 1000)
                setTimeout(() => {
                    clearInterval(loopId2);
                    clearTimeout(timeoutId);
                    setSprayerSrc(require('../assets/images/sprayer.png'));
                }, onTime * 1000);
                return loop;
            }
            loopId = setInterval(loop(), (onTime + offTime) * 1000);
        }
        else {
            clearInterval(loopId);
        }
    }

    const onChangeBrightness1 = async (bright: number) => {
        setBrightness(bright);
        if (bright % 5 != 0)
            return;

        let formatValue = Buffer.from(bright.toString()).toString("base64");

        bleManager.writeCharacteristicWithResponseForDevice(
            sprayer.id,
            SERVICE_ID,
            WRITE_STRING_CHAR_ID,
            formatValue
        );
    }

    const onChangeBrightness = async (toChange: string) => {

        let formatValue = Buffer.from("B").toString("base64");
        let bright = brightness;

        if (toChange == 'plus') {
            if (bright + 5 > 100)
                bright = 100;
            else
                bright += 5;
            formatValue = Buffer.from(bright.toString()).toString("base64");
        }
        else if (toChange == 'minus') {
            if (bright - 5 < 0)
                bright = 0;
            else
                bright -= 5;
            formatValue = Buffer.from(bright.toString()).toString("base64");
        }
        setBrightness(bright);

        bleManager.writeCharacteristicWithResponseForDevice(
            sprayer.id,
            SERVICE_ID,
            WRITE_STRING_CHAR_ID,
            formatValue
        );
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
                                source={sprayerSrc}
                            />
                            <Block row marginVertical={sizes.sm} justify="center" paddingVertical={sizes.s}>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}
                                    onPress={() => { onChangeBrightness('minus') }}>
                                    <Ionicons
                                        size={18}
                                        name="remove"
                                        color={colors.white}
                                    />
                                </Button>
                                <Text white position='absolute' >
                                    {brightness}
                                </Text>
                                <Block justify="center" marginHorizontal={sizes.s}>
                                    <Slider
                                        thumbTintColor={"#ffffff"}
                                        // maximumTrackTintColor={"#ffffff"}
                                        minimumTrackTintColor={"#ffffff"}
                                        minimumValue={0}
                                        maximumValue={100}
                                        onValueChange={(bright) => { onChangeBrightness1(Number(bright.toFixed(0))) }}
                                        value={brightness}
                                        tapToSeek
                                    />
                                </Block>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(255,255,255,0.2)"
                                    outlined={String(colors.white)}
                                    onPress={() => { onChangeBrightness('plus') }}>
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
                            <Button
                                shadow={false}
                                radius={sizes.m}
                                color="rgba(255,255,255,0.2)"
                                outlined={String(colors.white)}
                                onPress={setDefaultUsers}>
                                <Ionicons
                                    size={30}
                                    name="download-outline"
                                    color={colors.white}
                                />
                            </Button>
                        </Block>
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
                                setQuantity(item);
                                setModal(false);
                                setIndex(index);
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

function writeData(onTime: number, offTime: number, wsid: string, wcid: string) {
    let formatValue;
    formatValue = Buffer.from("A").toString("base64");

    bleManager.writeCharacteristicWithResponseForDevice(
        sprayer.id,
        wsid,
        wcid,
        formatValue
    ).then(characteristic => {
        // state wait
        console.log('wait');
        formatValue = Buffer.from(onTime.toString()).toString("base64");
        console.log(formatValue);
        bleManager.writeCharacteristicWithResponseForDevice(
            sprayer.id,
            wsid,
            wcid,
            formatValue
        ).then(characteristic => {
            // state acceptOne
            console.log('accept one');
            formatValue = Buffer.from(offTime.toString()).toString("base64");
            bleManager.writeCharacteristicWithResponseForDevice(
                sprayer.id,
                wsid,
                wcid,
                formatValue
            ).then(characteristic => {
                console.log('accept two, success');
            })
        })

    })
}

