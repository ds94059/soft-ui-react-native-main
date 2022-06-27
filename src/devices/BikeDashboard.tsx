import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
import { socket, macList, selectMac } from './Bike';

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
import { Slider } from "@miblanchard/react-native-slider"

const deviceList = ['EVpi']


const BikeDashboard = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showModal, setModal] = useState(false);
    const [quantity, setQuantity] = useState(deviceList[0]);
    const [selectedIdx, setIndex] = useState(0);
    const [rawData, setRawData] = useState("");
    const [logsVisible, setLogsVisible] = useState(true);

    const [brakeValue, setBrakeValue] = useState("0");
    const [jointStates, setJointStates] = useState([0, 0]);
    const [odom_position, setOdom_position] = useState([0, 0, 0]);
    const [odom_orientation, setOdom_orientation] = useState([0, 0, 0, 0]);
    const [odom_linear, setOdom_linear] = useState([0, 0, 0]);
    const [odom_angular, setOdom_angular] = useState([0, 0, 0]);


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
            socket.on(`evpi/${macList[i]}/sensors`, data => {
                console.log(`evpi/${macList[i]}/sensors: `, data)
                setRawData(JSON.stringify(data));

                if (data.joint_states[0])
                    setJointStates([data.joint_states[0], data.joint_states[1]]);
                if (data.odom.pose)
                    setOdom_position([data.odom.pose.position[0], data.odom.pose.position[1], data.odom.pose.position[2]]);
                if (data.odom.pose)
                    setOdom_orientation([data.odom.pose.orientation[0], data.odom.pose.orientation[1], data.odom.pose.orientation[2], data.odom.pose.orientation[3]]);
                if (data.odom.twist)
                    setOdom_linear([data.odom.twist.linear[0], data.odom.twist.linear[1], data.odom.twist.linear[2]]);
                if (data.odom.twist)
                    setOdom_angular([data.odom.twist.angular[0], data.odom.twist.angular[1], data.odom.twist.angular[2]]);
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
                        {t('device.bike.dashboard.title')}
                    </Text>
                </Button>
                <Block>
                    <Button
                        row
                        gradient={gradients.dark}
                        onPress={() => setModal(true)}
                        marginHorizontal={sizes.m}
                        marginVertical={sizes.s}
                    >
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



                    <Block row marginVertical={sizes.s} flex={1.2}>
                        <Block card marginHorizontal={sizes.s} >
                            <Block align="center">
                                <Image source={require('../assets/images/brake.png')} width={100} height={100} />
                            </Block>
                            <Block marginTop={sizes.sm}>
                                <Slider
                                    // thumbTintColor={"#ffffff"}
                                    minimumValue={0}
                                    maximumValue={180}
                                    // minimumTrackTintColor={"#ffffff"}
                                    value={Number(brakeValue)}
                                    onValueChange={(value) => {
                                        let brake = Number(value).toFixed(0);
                                        setBrakeValue(brake);
                                    }}
                                    onSlidingComplete={(value) => {
                                        if (value > 179)
                                            value = 179;
                                        if (value < 0)
                                            value = 0;
                                        const brakeValue = Number(value).toFixed(0);
                                        const msg = {
                                            mac: selectMac,
                                            topic: "brake_servo",
                                            msg: brakeValue
                                        }
                                        socket.emit('evpi', JSON.stringify(msg));
                                        console.log(JSON.stringify(msg))
                                    }}
                                />
                                <Text align='center'>
                                    {brakeValue}
                                </Text>
                            </Block>
                        </Block>
                        <Block card marginHorizontal={sizes.s}>
                            <Text bold align='center'>
                                Joint States
                            </Text>

                            <Block row >
                                <Block >
                                    <Block row align='center'>
                                        <Block>
                                            <Image
                                                source={require('../assets/images/front-wheel.png')}
                                                width={40}
                                                height={40}
                                            />
                                        </Block>
                                        <Block marginRight={28}>
                                            <Image
                                                source={require('../assets/images/front-wheel.png')}
                                                width={40}
                                                height={40}
                                                transform={[{ rotate: '180deg' }]}
                                            />
                                        </Block>
                                    </Block>
                                    <Text align='center' marginRight={14} bold>
                                        front:
                                    </Text>
                                    <Text align='center' marginRight={14}>
                                        {jointStates[0].toFixed(3)}
                                    </Text>
                                </Block>
                                <Block >
                                    <Block align='center' justify='center'>
                                        <Image
                                            source={require('../assets/images/back-wheel.png')}
                                            width={50}
                                            height={50}
                                        />
                                    </Block>
                                    <Text align='center' bold>
                                        back:
                                    </Text>
                                    <Text align='center'>
                                        {jointStates[1].toFixed(3)}
                                    </Text>
                                </Block>
                            </Block>


                        </Block>
                    </Block>
                    <Block row marginVertical={sizes.s} flex={1.2}>
                        <Block card marginHorizontal={sizes.s} >
                            <Text bold align='center'>
                                Odom Pose
                            </Text>

                            <Block row >
                                <Block >
                                    <Block align='center' justify='center'>
                                        <Image
                                            source={require('../assets/images/position.png')}
                                            width={50}
                                            height={50}
                                        />
                                    </Block>
                                    <Block>
                                        <Text size={10} align='center' bold>
                                            position:
                                        </Text>
                                        <Text size={12} align='center'>
                                            {odom_position[0].toFixed(2)}, {odom_position[1].toFixed(2)}, {odom_position[2].toFixed(2)}
                                        </Text>
                                    </Block>
                                </Block>
                                <Block>
                                    <Block align='center' justify='center'>
                                        <Image
                                            source={require('../assets/images/orientation.png')}
                                            width={50}
                                            height={50}
                                        />
                                    </Block>
                                    <Block>
                                        <Text size={10} align='center' bold>
                                            orientation:
                                        </Text>
                                        <Text size={12} align='center'>
                                            {odom_orientation[0].toFixed(1)}, {odom_orientation[1].toFixed(1)}, {odom_orientation[2].toFixed(1)}, {odom_orientation[3].toFixed(3)}
                                        </Text>
                                    </Block>
                                </Block>
                            </Block>
                        </Block>
                        <Block card marginHorizontal={sizes.s}>
                            <Text bold align='center'>
                                Odom Twist
                            </Text>


                            <Block row>
                                <Block >
                                    <Block align='center' justify='center'>
                                        <Image

                                            source={require('../assets/images/linear.png')}
                                            width={50}
                                            height={50}
                                        />
                                    </Block>
                                    <Block>
                                        <Text size={12} align='center' bold>
                                            linear:
                                        </Text>
                                        <Text size={12} align='center'>
                                            {odom_linear[0].toFixed(2)}, {odom_linear[1].toFixed(2)}, {odom_linear[2].toFixed(2)}
                                        </Text>
                                    </Block>
                                </Block>
                                <Block >
                                    <Block align='center' justify='center'>
                                        <Image
                                            source={require('../assets/images/angular.png')}
                                            width={50}
                                            height={50}
                                        />
                                    </Block>
                                    <Block>
                                        <Text size={12} align='center' bold>
                                            angular:
                                        </Text>
                                        <Text size={12} align='center'>
                                            {odom_angular[0].toFixed(1)}, {odom_angular[1].toFixed(1)}, {odom_angular[2].toFixed(1)}
                                        </Text>
                                    </Block>
                                </Block>
                            </Block>
                        </Block>
                    </Block>
                    <Button
                        marginTop={sizes.s}
                        marginHorizontal={sizes.s}
                        outlined={String(colors.white)}
                        onPress={() => { setLogsVisible(!logsVisible); }}
                    >
                        <Text white bold>
                            Logs ---
                        </Text>
                    </Button>
                    <Block scroll marginHorizontal={sizes.s}>
                        {
                            logsVisible ?
                                <Text white>
                                    {rawData}
                                </Text> :
                                <></>
                        }
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

            </Image >
            <Modal visible={showModal} onRequestClose={() => setModal(false)}>
                <FlatList
                    keyExtractor={(index) => `${index}`}
                    data={deviceList}
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

export default BikeDashboard;