import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import webSocket from "socket.io-client"

import Speedometer, {
    Background,
    Arc,
    Needle,
    Progress,
    Marks,
    Indicator,
} from 'react-native-cool-speedometer';
import { Line, Text as SVGText, G } from 'react-native-svg'
// import Slider from '@react-native-community/slider';
// import { Slider } from "@miblanchard/react-native-slider"

// const endPoint = "http://20.219.220.110:5000";
const endPoint = "http://10.100.1.93:5000"
const socket = webSocket(endPoint);
const macList = ['C522F405D062', 'ddd']

const Dashboard = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState(macList[0]);
    const [selectedIdx, setIndex] = useState(0);
    const [evpiData, setEvpiData] = useState("");

    const [humid, setHumid] = useState(0);
    const [humidToSet, setHumidToSet] = useState(25);
    const [temp, setTemp] = useState(0);
    const [tempToSet, setTempToSet] = useState(25);


    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        initSocket();
        return () => {
            StatusBar.setBarStyle('dark-content');
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, []);

    // const renderAboveThumbComponent = () => {
    //     const thumbnailWidth = 25;
    //     return <Block style={{
    //         alignItems: 'center',
    //         backgroundColor: 'grey',
    //         borderColor: 'purple',
    //         borderWidth: 1,
    //         height: 40,
    //         justifyContent: 'center',
    //         left: -thumbnailWidth / 2,
    //         width: thumbnailWidth,
    //     }}
    //     >
    //         <Text white>
    //             {humid}
    //         </Text>
    //     </Block>;
    // };

    const initSocket = () => {
        console.log('init websocket');
        socket.connect();

        for (let i = 0; i < macList.length; i++) {
            // socket.on(`mycelium/${macList[i]}/sensors`, data => {
            //     if (quantity == macList[i]) {
            //         console.log(`mycelium/${macList[i]}/sensors: `, data);
            //     }
            // })
            socket.on(`mycelium/${macList[i]}/humid`, humid => {
                if (quantity == macList[i]) {
                    console.log(`mycelium/${macList[i]}/humid: `, humid);
                    setHumid(humid);
                }
            })
            socket.on(`mycelium/${macList[i]}/temp`, temp => {
                if (quantity == macList[i]) {
                    console.log(`mycelium/${macList[i]}/temp: `, temp);
                    setTemp(temp);
                }
            })

            socket.on(`evpi/${macList[i]}/sensors`, data => {
                console.log(`evpi/${macList[i]}/sensors: `, data)
                setEvpiData(JSON.stringify(data));
            })
        }
    }

    return (
        <Block safe marginTop={sizes.md} >
            <Image
                style={{ flex: 1 }}
                background
                resizeMode="cover"
                padding={sizes.sm}
                paddingBottom={sizes.l}
                radius={sizes.cardRadius}
                source={assets.background}
            >
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
                        {t('device.dashboard.title')}
                    </Text>
                </Button>
                <Block>
                    <Button
                        row
                        gradient={gradients.dark}
                        onPress={() => setModal(true)}
                        marginHorizontal={sizes.m}
                        marginBottom={sizes.s}>
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
                    <Block row marginVertical={sizes.m} >
                        <Block align='center' height={'50%'} >
                            <Speedometer
                                width={170}
                                value={humid}
                                min={0}
                                max={100}
                                fontFamily='squada-one'
                            >
                                <Background />
                                <Arc arcWidth={20} />
                                <Needle />
                                <Progress />
                                <Marks step={10} />
                                <Indicator prefix='濕度 ' postfix='%' fontSize={16} />
                            </Speedometer>
                            <Block row marginVertical={sizes.m} width={'100%'} align="center" justify="space-around">
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(0,0,0,0.2)"
                                    onPress={() => {
                                        setHumidToSet(humidToSet - 1)
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-back-sharp"
                                        color={colors.white}
                                    />
                                </Button>

                                <Text white>
                                    {humidToSet}
                                </Text>

                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(0,0,0,0.2)"
                                    onPress={() => {
                                        setHumidToSet(humidToSet + 1)
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-forward-sharp"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                        <Block align='center' height={'50%'}>
                            <Speedometer
                                width={170}
                                value={temp}
                                min={-20}
                                max={40}
                                accentColor="red"
                                fontFamily='squada-one'
                            >
                                <Background />
                                <Arc arcWidth={20} />
                                <Needle />
                                <Progress />
                                <Marks step={5} />
                                <Indicator prefix='溫度 ' postfix='°C' fontSize={16} />
                            </Speedometer>
                            <Block row marginVertical={sizes.m} width={'100%'} align="center" justify="space-around">
                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(0,0,0,0.2)"
                                    onPress={() => {
                                        setTempToSet(tempToSet - 1)
                                        socket.emit('brake_servo', 180)
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-back-sharp"
                                        color={colors.white}
                                    />
                                </Button>

                                <Text white>
                                    {tempToSet}
                                </Text>

                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(0,0,0,0.2)"
                                    onPress={() => {
                                        setTempToSet(tempToSet + 1)
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-forward-sharp"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                    </Block>

                    <Text white>
                        {evpiData}
                    </Text>

                    {/* <Slider
                        thumbTintColor={"#ffffff"}
                        // maximumTrackTintColor={"#ffffff"}
                        minimumTrackTintColor={"#ffffff"}
                        minimumValue={0}
                        maximumValue={100}
                        onValueChange={() => { }}
                        value={humid}
                        tapToSeek
                    /> */}
                    {/* <Slider
                        animateTransitions
                        renderAboveThumbComponent={renderAboveThumbComponent}
                        minimumValue={0}
                        maximumValue={100}
                        value={humid}
                        onValueChange={(value) => { setHumid(Number(Number(value).toFixed(0))) }}
                    /> */}
                </Block>

            </Image >
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={macList}
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

const styles = StyleSheet.create({

});

export default Dashboard;