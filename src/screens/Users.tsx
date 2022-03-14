import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Linking, StatusBar, View, FlatList, Alert } from 'react-native';
import * as RNFS from 'react-native-fs';
import Dialog from "react-native-dialog";
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { Block, Button, Image, Text, Modal, Input } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import { userConfig } from '../devices/Sprayer';
import { toNumber } from 'i18n-js';

interface IUser {
    id: number | string;
    name: string;
    onTime: number;
    offTime: number;
}

const Users = () => {
    const { users } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const isFocused = useIsFocused();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showModal, setModal] = useState(false);
    const [userData, setuserData] = useState<IUser[]>([]);
    const [quantity, setQuantity] = useState("");
    const [userNames, setuserNames] = useState<string[]>([]);
    const [onTime, setonTime] = useState(0);
    const [offTime, setoffTime] = useState(0);
    const [nameDlVisible, setNameDlVisible] = useState(false);
    const [onTimeDlVisible, setOnTimeDlVisible] = useState(false);
    const [offTimeDlVisible, setOffTimeDlVisible] = useState(false);
    const [newPersonName, setNewPersonName] = useState("");
    const [newOnTime, setNewOnTime] = useState(0);
    const [newOffTime, setNewOffTime] = useState(0);

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
        while (userData.length > 0) {
            userData.pop();
        }
        userConfig.users.forEach((user: any, index: number) => {
            userData.push({ id: index, name: user.name, onTime: user.onTime, offTime: user.offTime });
        })

        while (userNames.length > 0) {
            userNames.pop();
        }
        userData.forEach((user) => {
            userNames.push(user.name);
        })

        if (userData.length == 0) {
            setQuantity("None");
            setonTime(0);
            setoffTime(0);
        }
        else {
            setQuantity(userData[0].name);
            setonTime(userData[0].onTime);
            setoffTime(userData[0].offTime);
        }
    }

    const handleEditonTime = (time: number) => {
        setonTime(time);
        userData[selectedIdx].onTime = time;
        handleSave();
    }

    const handleEditoffTime = (time: number) => {
        setoffTime(time);
        userData[selectedIdx].offTime = time;
        handleSave();
    }

    const handleSave = () => {
        // const path = '/storage/emulated/0/Download/data.json';
        const path = RNFS.DocumentDirectoryPath + '/data.json';

        userConfig.users = [];
        userData.forEach((user: IUser, index: number) => {
            userConfig.users.push({ name: user.name, onTime: user.onTime, offTime: user.offTime });
        });
        console.log(userData);

        RNFS.writeFile(path, JSON.stringify(userConfig), 'utf8')
            .then((success) => {
                console.log('FILE WRITTEN!');
            })
            .catch((err) => {
                console.log(err.message);
            });
    }

    const handleCancel = () => {
        setNameDlVisible(false);
        setOnTimeDlVisible(false);
        setOffTimeDlVisible(false);
        console.log("Cancel Pressed");
    }

    const handleDelete = () => {
        Alert.alert(
            "Person delete",
            "Do you want to delete this account?\nYou cannot undo this action.",
            [
                {
                    text: "Cancel",
                    onPress: () => {
                        console.log("Cancel Pressed");
                    },
                    style: "cancel"
                },
                {},
                {
                    text: "OK",
                    onPress: () => {
                        console.log("OK Pressed");
                        userNames.splice(selectedIdx, 1);
                        userData.splice(selectedIdx, 1);

                        if (userData.length > 0) {
                            setIdx(0);
                            setQuantity(userData[0].name);
                            setImageSrc(imgData[0]);
                            setonTime(userData[0].onTime);
                            setoffTime(userData[0].offTime);
                        }
                        else {
                            setIdx(0);
                            setQuantity("");
                            setonTime(0);
                            setoffTime(0);
                        }
                        handleSave();
                    }
                }
            ]
        );


    }

    const handleAddPerson = async () => {
        setOffTimeDlVisible(false);
        const result = await launchImageLibrary({
            mediaType: 'photo',
            maxHeight: 350,
            maxWidth: 350
        });

        if (newPersonName == "" || newOnTime == 0 || newOffTime == 0) {
            Alert.alert("Error", "Parameter missed!");
            return;
        }

        console.log(newPersonName);
        console.log(newOnTime);
        console.log(newOffTime);
        const toPush: IUser = { id: userData.length, name: newPersonName, onTime: newOnTime, offTime: newOffTime };
        userData.push(toPush);

        userNames.push(newPersonName);

        const index = userData.length - 1;
        setIdx(index);
        setQuantity(userData[index].name);
        setImageSrc(imgData[index]);
        setonTime(userData[index].onTime);
        setoffTime(userData[index].offTime);

        handleSave();
    }

    useEffect(() => {
        if (isFocused) {
            initData();
            StatusBar.setBarStyle('light-content');
            return () => {
                StatusBar.setBarStyle('dark-content');
            };
        }
    }, [isFocused]);

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
                                            setQuantity(userData[selectedIdx - 1].name);
                                            setImageSrc(imgData[selectedIdx - 1]);
                                            setonTime(userData[selectedIdx - 1].onTime);
                                            setoffTime(userData[selectedIdx - 1].offTime);
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
                                        if (selectedIdx < userNames.length - 1) {
                                            setIdx(selectedIdx + 1);
                                            setQuantity(userData[selectedIdx + 1].name);
                                            setImageSrc(imgData[selectedIdx + 1]);
                                            setonTime(userData[selectedIdx + 1].onTime);
                                            setoffTime(userData[selectedIdx + 1].offTime);
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
                        <Block row>
                            <Block align='flex-start'>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(255,255,255,0.7)"
                                    //outlined={String(colors.white)}
                                    onPress={() => { handleDelete() }}>
                                    <Ionicons
                                        size={32}
                                        name="trash"
                                        color={colors.danger}
                                    />
                                </Button>
                            </Block>
                            <Block align='flex-end'>
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(255,255,255,0.3)"
                                    outlined={String(colors.white)}
                                    onPress={() => { setNameDlVisible(true); setNewPersonName(''); }}>
                                    <Ionicons
                                        size={30}
                                        name="person-add"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                    </Image>
                </Block>
            </Block >
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={userNames}
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
            <Dialog.Container visible={nameDlVisible}>
                <Dialog.Title style={{ color: "#000000" }}>Add person</Dialog.Title>
                <Dialog.Description>Please enter the name.</Dialog.Description>
                <Dialog.Input
                    placeholder='Name'
                    style={{ color: "#000000" }}
                    onChangeText={(text) => {
                        setNewPersonName(text);
                    }} />
                <Dialog.Button label="Cancel" onPress={handleCancel} />
                <Dialog.Button label="Next" onPress={() => { setOnTimeDlVisible(true); setNameDlVisible(false); }} />
            </Dialog.Container>
            <Dialog.Container visible={onTimeDlVisible}>
                <Dialog.Title style={{ color: "#000000" }}>Add person</Dialog.Title>
                <Dialog.Description>Please enter the on time.</Dialog.Description>
                <Dialog.Input
                    placeholder='On Time'
                    style={{ color: "#000000" }}
                    onChangeText={(text) => {
                        setNewOnTime(Number(text));
                    }} />
                <Dialog.Button label="Cancel" onPress={handleCancel} />
                <Dialog.Button label="Next" onPress={() => { setOffTimeDlVisible(true); setOnTimeDlVisible(false); }} />
            </Dialog.Container>
            <Dialog.Container visible={offTimeDlVisible}>
                <Dialog.Title style={{ color: "#000000" }}>Add person</Dialog.Title>
                <Dialog.Description>Please enter the off time.</Dialog.Description>
                <Dialog.Input
                    placeholder='Off Time'
                    style={{ color: "#000000" }}
                    onChangeText={(text) => {
                        setNewOffTime(Number(text));
                    }} />
                <Dialog.Button label="Cancel" onPress={handleCancel} />
                <Dialog.Button label="Add" onPress={handleAddPerson} />
            </Dialog.Container>
        </Block >
    );
};

export default Users;