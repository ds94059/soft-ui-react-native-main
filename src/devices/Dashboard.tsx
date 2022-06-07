import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { Ionicons } from '@expo/vector-icons';

import { Block, Button, Image, Text, Modal } from '../components/';
import { useData, useTheme, useTranslation } from '../hooks/';
import MQTT from 'sp-react-native-mqtt';



const Dashboard = () => {
    const { user } = useData();
    const { assets, colors, gradients, sizes } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const [humid, setHumid] = useState(0);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        initMqtt();
        return () => {
            StatusBar.setBarStyle('dark-content');
        };
    }, []);

    const initMqtt = () => {
        /* create mqtt client */
        MQTT.createClient({
            uri: 'mqtt://test.mosquitto.org:1883',
            clientId: 'your_client_id'
        }).then(function (client) {

            client.on('closed', function () {
                console.log('mqtt.event.closed');
            });

            client.on('error', function (msg) {
                console.log('mqtt.event.error', msg);
            });

            client.on('message', function (msg) {
                console.log('mqtt.event.message', msg);
                if (msg.topic == 'Try/MQTT') {
                    console.log(msg.data)
                }
            });

            client.on('connect', function () {
                console.log('connected');
                client.subscribe('Try/MQTT', 0);
                client.publish('/data', "test", 0, false);
            });

            client.connect();
        }).catch(function (err) {
            console.log(err);
        });
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
                    <Text white>
                        {humid}
                    </Text>
                </Block>

            </Image>
        </Block >
    );
};

export default Dashboard;