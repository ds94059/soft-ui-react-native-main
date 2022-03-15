import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, Alert, FlatList, PermissionsAndroid, TouchableOpacity, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import * as RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/core';
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
global.Buffer = global.Buffer || require('buffer').Buffer
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ImageSourcePropType } from 'react-native';

import { Block, Button, Image, Text, Switch, Modal, Input } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import { bleManager, sprayer } from '../screens/Home';

import { userConfig } from '../devices/Sprayer';

interface IUser {
    id: number | string;
    name: string;
    onTime: number;
    offTime: number;
    imageSrc: ImageSourcePropType;
}

let name: string = "", onTime: number = 0, offTime: number = 0, photoUri: string = "";

const AddUser = () => {
    const { assets, colors, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [photoSrc, setPhotoSrc] = useState(require('../assets/images/dotLine.png'));
    const [nameDanger, setNameDanger] = useState(false);
    const [onTimeDanger, setOnTimeDanger] = useState(false);
    const [offTimeDanger, setOffTimeDanger] = useState(false);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    useEffect(() => {
        if (isFocused) {
        }
    }, [isFocused]);

    const AddPhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            maxHeight: 1000,
            maxWidth: 1000
        });
        console.log(result);
        if (result.assets && result.assets[0].uri) {
            photoUri = result.assets[0].uri;
            console.log(photoUri);
            setPhotoSrc({ uri: photoUri });
        }
        else if (result.didCancel) {
            console.log("canceled.");
        }
        else {
            Alert.alert("Select photo error", "The photo is possibly null.");
        }
    }

    const handleChangeText = (option: string, text: string) => {
        if (option == "name") {
            if (!text) setNameDanger(true); else setNameDanger(false);
            name = text;
        }
        else if (option == "on-time") {
            if (!(Number(text) >= 0 && Number(text) < 10)) setOnTimeDanger(true); else setOnTimeDanger(false);
            onTime = Number(text);
        }
        else if (option == "off-time") {
            if (!(Number(text) >= 0 && Number(text) < 10)) setOffTimeDanger(true); else setOffTimeDanger(false);
            offTime = Number(text);
        }
    }

    const handleSave = () => {
        const path = RNFS.DocumentDirectoryPath + '/data.json';
        console.log(name, onTime, offTime);

        if (isNaN(onTime) || onTime < 0 || onTime > 9 || isNaN(offTime) || offTime < 0 || offTime > 9) {
            Alert.alert("Syntax error.", "Please enter 0~9.");
        }
        else if (name && onTime && offTime) {
            if (photoUri)
                userConfig.users.push({ name: name, onTime: onTime, offTime: offTime, imageSrc: { uri: photoUri } });
            else
                userConfig.users.push({ name: name, onTime: onTime, offTime: offTime, imageSrc: require('../assets/images/user.png') });

            RNFS.writeFile(path, JSON.stringify(userConfig), 'utf8')
                .then((success) => {
                    console.log('FILE WRITTEN!');
                })
                .catch((err) => {
                    console.log(err.message);
                });
            navigation.goBack();
        }
        else {
            Alert.alert("Parameter missing.", "Check if the blank is space.");
        }
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
                                {t('device.sprayer.adduser.title')}
                            </Text>
                        </Button>
                        <Block flex={0} align="center">
                            <TouchableOpacity onPress={AddPhoto}>
                                <Image
                                    width={300}
                                    height={300}
                                    marginBottom={sizes.sm}
                                    source={photoSrc}
                                />
                            </TouchableOpacity>
                        </Block>
                    </Image>
                    <Block marginTop={sizes.sm}>

                        <Input placeholder="Name" marginBottom={sizes.sm} danger={nameDanger} onChangeText={(text) => { handleChangeText("name", text); }} />
                        <Input placeholder="On Time [0-9]s" marginBottom={sizes.sm} danger={onTimeDanger} onChangeText={(text) => { handleChangeText("on-time", text); }} />
                        <Input placeholder="Off Time [0-9]s" marginBottom={sizes.sm} danger={offTimeDanger} onChangeText={(text) => { handleChangeText("off-time", text); }} />
                    </Block>
                    <Block align='flex-end'>
                        <Button
                            shadow={false}
                            radius={sizes.m}
                            color="rgba(0,0,0,0.2)"
                            outlined={String(colors.black)}
                            onPress={handleSave}>
                            <Ionicons
                                size={30}
                                name="checkmark-sharp"
                                color={colors.white}
                            />
                        </Button>
                    </Block>

                </Block>
            </Block >
        </Block >
    );
};

export default AddUser;