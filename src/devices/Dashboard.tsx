import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import { socket } from './Bike';

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

const macList = ['BFC1C5DD4C53', '47B74C7E7C31', 'FD3962C2D421', 'DB50AD1A2C93'];
let selectMac = macList[0];

const Dashboard = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState(macList[0]);
    const [selectedIdx, setIndex] = useState(0);

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
        if (!socket.connected)
            socket.connect();
        console.log(socket.connected);

        for (let i = 0; i < macList.length; i++) {

            socket.on(`mycelium/${macList[i]}/sensors`, data => {
                if (selectMac == macList[i]) {
                    setHumid(data.humid);
                    setTemp(data.temp);
                }
            })
        }
    }

    const publishToCloud = (topic: string, value: number) => {
        const msg = {
            mac: selectMac,
            topic: topic,
            msg: value
        }
        socket.emit('mycelium', JSON.stringify(msg));
        console.log(JSON.stringify(msg))

    }

    return (
        <Block safe marginTop={sizes.md}>
            {/* <Image
                style={{ flex: 1 }}
                background
                resizeMode="cover"
                padding={sizes.sm}
                paddingBottom={sizes.l}
                radius={sizes.cardRadius}
                source={assets.background}
            > */}
            <Block scroll contentContainerStyle={{ paddingBottom: sizes.padding }}>
                <Block padding={sizes.sm} white>
                    <Button
                        row
                        flex={0}
                        justify="flex-start"
                        onPress={() => navigation.goBack()}>
                        <Image
                            radius={0}
                            width={10}
                            height={18}
                            color={colors.gray}
                            source={assets.arrow}
                            transform={[{ rotate: '180deg' }]}
                        />
                        <Text p marginLeft={sizes.s}>
                            {t('device.dashboard.title')}
                        </Text>
                    </Button>

                </Block>

                <Block>
                    <Button
                        row
                        gradient={gradients.dark}
                        onPress={() => setModal(true)}
                        marginVertical={sizes.s}
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

                    <Block row marginVertical={sizes.s} >
                        <Block align='center' card color={"#C1EDFF"} marginHorizontal={sizes.s}>
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
                                        setHumidToSet(humidToSet - 1);
                                        publishToCloud("set_humid", humidToSet - 1);
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-back-sharp"
                                        color={colors.white}
                                    />
                                </Button>

                                <Text p>
                                    {humidToSet}
                                </Text>

                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(0,0,0,0.2)"
                                    onPress={() => {
                                        setHumidToSet(humidToSet + 1);
                                        publishToCloud("set_humid", humidToSet + 1);
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-forward-sharp"
                                        color={colors.white}
                                    />
                                </Button>
                            </Block>
                        </Block>
                        <Block align='center' card color={'#E48384'} marginHorizontal={sizes.s}>
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
                                        setTempToSet(tempToSet - 1);
                                        publishToCloud("set_temp", tempToSet - 1)
                                    }}>
                                    <Ionicons
                                        size={18}
                                        name="ios-caret-back-sharp"
                                        color={colors.white}
                                    />
                                </Button>

                                <Text p>
                                    {tempToSet}
                                </Text>

                                <Button
                                    shadow={false}
                                    radius={sizes.m}
                                    color="rgba(0,0,0,0.2)"
                                    onPress={() => {
                                        setTempToSet(tempToSet + 1);
                                        publishToCloud("set_temp", tempToSet + 1);
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
            </Block>


            {/* </Image > */}
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={macList}
                    renderItem={({ item, index }) => (
                        <Button
                            marginBottom={sizes.sm}
                            onPress={() => {
                                setQuantity(item);
                                selectMac = item;
                                setModal(false);
                                setIndex(index);
                                setHumid(0);
                                setTemp(0);
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