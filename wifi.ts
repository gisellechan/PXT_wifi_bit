namespace IoT {
    let flag = true;
    let httpReturnArray: string[] = []
    let inbound1 = ""
    let inbound2 = ""
    let outbound1 = ""
    let outbound2 = ""
    let temp_cmd = ""
    let lan_cmd = ""
    let wan_cmd = ""
    let Lan_connected = false
    let Wan_connected = false
    type EvtAct = () => void;
    let LAN_Remote_Conn: EvtAct = null;
    let WAN_Remote_Conn: EvtAct = null;

    export enum httpMethod {
        //% block="GET"
        GET,
        //% block="POST"
        POST,
        //% block="PUT"
        PUT,
        //% block="DELETE"
        DELETE
    }

    export enum bound_no {
        //% block="1"
        bound1,
        //% block="2"
        bound2
    }

    // -------------- 1. Initialization ----------------
    //%blockId=wifi_ext_board_initialize_wifi
    //%block="Initialize Wifi Extension Board and OLED"
    //% weight=140
    //% blockGap=7	
    export function initializeWifi(): void {
        serial.redirect(SerialPin.P16, SerialPin.P8, BaudRate.BaudRate115200);
        MuseOLED.init(32, 128)

        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            temp_cmd = serial.readLine()
            //MuseOLED.showString(temp_cmd)
            let tempDeleteFirstCharacter = ""

            if (temp_cmd.charAt(0).compare("#") == 0) {
                tempDeleteFirstCharacter = temp_cmd.substr(1, 20)
                httpReturnArray.push(tempDeleteFirstCharacter)
            } else if (temp_cmd.charAt(0).compare("*") == 0) {

                // For digital, pwm, servo
                let mode = temp_cmd.substr(1, 1)
                let intensity = 0
                let pin = 0

                if (mode == "0") {	//digital
                    pin = parseInt(temp_cmd.substr(3, 2))
                    intensity = parseInt(temp_cmd.substr(2, 1))

                    pins.digitalWritePin(pin, intensity)

                } else if (mode == "1") { //pwm
                    pin = parseInt(temp_cmd.substr(5, 2))
                    intensity = pins.map(parseInt(temp_cmd.substr(2, 3)), 100, 900, 0, 1023)

                    pins.analogWritePin(pin, intensity)

                } else if (mode == "2") { //servo
                    pin = parseInt(temp_cmd.substr(5, 2))
                    intensity = pins.map(parseInt(temp_cmd.substr(2, 3)), 100, 900, 0, 180)

                    pins.servoWritePin(pin, intensity)

                }

            } else if (temp_cmd.charAt(0).compare("$") == 0) {
                let no = parseInt(temp_cmd.substr(1, 1))
                let string_word = temp_cmd.substr(2, 20)

                if (no == 1) {
                    inbound1 = string_word
                } else if (no == 2) {
                    inbound2 = string_word
                }

            } else if (Lan_connected && temp_cmd.charAt(0).compare(",") == 0) {
                lan_cmd = temp_cmd.substr(1, 20)
                //MuseOLED.showString(lan_cmd)
                if (LAN_Remote_Conn) LAN_Remote_Conn()
            } else if (Wan_connected && temp_cmd.charAt(0).compare(":") == 0) {
                wan_cmd = temp_cmd.substr(1, 20)
                //MuseOLED.showString(wan_cmd)
                if (WAN_Remote_Conn) WAN_Remote_Conn()
            } else {
                MuseOLED.showString(temp_cmd)
            }

        })

        basic.pause(5000);
    }

    // -------------- 2. WiFi ----------------
    //% blockId=wifi_ext_board_set_wifi
    //% block="Set wifi to ssid %ssid| pwd %pwd"   
    //% weight=135
    export function setWifi(ssid: string, pwd: string): void {
        serial.writeLine("(AT+wifi?ssid=" + ssid + "&pwd=" + pwd + ")");
    }


    // -------------- 3. LAN/WAN Repmote ----------------
    //%blockId=wifi_ext_board_start_server_LAN
    //%block="Start WiFi remote control (LAN)"
    //% weight=130
    //% blockGap=7		
    export function startWebServer_LAN(): void {
        flag = true
        serial.writeLine("(AT+startWebServer)")
        Lan_connected = true
        while (flag) {

            serial.writeLine("(AT+write_sensor_data?p0=" + pins.analogReadPin(AnalogPin.P0) + "&p1=" + pins.analogReadPin(AnalogPin.P1) + "&p2=" + pins.analogReadPin(AnalogPin.P2) + "&outbound1=" + outbound1 + "&outbound2=" + outbound2 + ")")
            basic.pause(500)
            if (!flag)
                break;
        }

    }

    //%blockId=wifi_ext_board_lan_command
    //%block="LAN control command"
    //% weight=125
    //% blockGap=7		
    export function control_command_LAN(): string {

        return lan_cmd;

    }

    //%blockId=wifi_ext_board_on_LAN_connect
    //%block="On LAN command received"
    //% weight=120
    export function on_LAN_remote(handler: () => void): void {
        LAN_Remote_Conn = handler;
    }

    //%blockId=wifi_ext_board_start_server_WAN
    //%block="Start WiFi remote control (WAN)"
    //% weight=115
    //% blockGap=7		
    export function startWebServer_WAN(): void {
        flag = true
        serial.writeLine("(AT+pubnub)")
        Wan_connected = true
        
    }

    //%blockId=wifi_ext_board_wan_command
    //%block="WAN control command"
    //% weight=110
    //% blockGap=7	
    export function control_command_WAN(): string {

        return wan_cmd;

    }

    //%blockId=wifi_ext_board_on_wan_connect
    //%block="On WAN command received"
    //% weight=105
    export function on_WAN_remote(handler: () => void): void {
        WAN_Remote_Conn = handler;
    }

    // -------------- 4. Cloud ----------------
    //% blockId=wifi_ext_board_set_thingspeak
    //% block="Send Thingspeak key* %key|field1 %field1|field2 %field2|field3 %field3"
    //% weight=100
    //% blockGap=7	
    export function sendThingspeak(key: string, field1: number, field2: number, field3: number): void {
        serial.writeLine("(AT+thingspeak?key=" + key + "&field1=" + field1 + "&field2=" + field2 + "&field3=" + field3 + ")");
    }


    //% blockId=wifi_ext_board_set_ifttt
    //% block="Send IFTTT key* %key|event_name* %event|value1 %value1|value2 %value2|value3 %value3"
    //% weight=95
    //% blockGap=7		
    export function sendIFTTT(key: string, eventname: string, value1: number, value2: number, value3: number): void {
        serial.writeLine("(AT+ifttt?key=" + key + "&event=" + eventname + "&value1=" + value1 + "&value2=" + value2 + "&value3=" + value3 + ")");
    }

    // -------------- 5. Others ----------------
    //% blockId=wifi_ext_board_set_wifi_hotspot
    //% block="Set hotspot to ssid %ssid| pwd %pwd"   
    //% weight=90	
    //% blockGap=7	
    export function setWifiHotspot(ssid: string, pwd: string): void {
        serial.writeLine("(AT+wifi_hotspot?ssid=" + ssid + "&pwd=" + pwd + ")");
    }



    // -------------- 6. Advanced Wifi ----------------

    //%subcategory=More
    //%blockId=wifi_ext_board_initialize_wifi_normal
    //%block="Initialize Wifi Extension Board"
    //% weight=85
    //% blockGap=7
    export function initializeWifiNormal(): void {
        serial.redirect(SerialPin.P16, SerialPin.P8, BaudRate.BaudRate115200);
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_generic_http
    //% block="Send generic HTTP method %method| http://%url| header %header| body %body"
    //% weight=80
    //% blockGap=7	
    export function sendGenericHttp(method: httpMethod, url: string, header: string, body: string): void {
        httpReturnArray = []
        let temp = ""
        switch (method) {
            case httpMethod.GET:
                temp = "GET"
                break
            case httpMethod.POST:
                temp = "POST"
                break
            case httpMethod.PUT:
                temp = "PUT"
                break
            case httpMethod.DELETE:
                temp = "DELETE"
                break
        }
        serial.writeLine("(AT+http?method=" + temp + "&url=" + url + "&header=" + header + "&body=" + body + ")");
    }

    //%subcategory=More
    //% blockId="wifi_ext_board_generic_http_return" 
    //% block="HTTP response (string array)"
    //% weight=75
    //% blockGap=7	

    export function getGenericHttpReturn(): Array<string> {
        return httpReturnArray;
    }

    //%subcategory=More
    //% blockId="wifi_ext_board_http_inbound" 
    //% block="HTTP inbound %no"
    //% weight=70
    //% blockGap=7	

    export function getInbound(no: bound_no): string {
        let temp = ""
        switch (no) {
            case bound_no.bound1:
                temp = inbound1;
                break
            case bound_no.bound2:
                temp = inbound2;
                break
        }
        return temp;
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_http_outbound1
    //%block="Set HTTP outbound %no| %wordinds"
    //% weight=65	
    //% blockGap=7		
    export function setOutbound(no: bound_no, wordinds: string): void {

        switch (no) {
            case bound_no.bound1:
                outbound1 = wordinds;
                break
            case bound_no.bound2:
                outbound2 = wordinds;
                break
        }
    }

    //%subcategory=More
    //% blockId="wifi_ext_board_tostring" 
    //% block="Convert number %no|to string"
    //% weight=60

    export function changetostring(no: number): string {

        return no.toString();
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_muse_mqtt
    //%block="Connect to Muse MQTT server"
    //% weight=55
    //% blockGap=7	
    export function connectMuseMQTT(): void {
        serial.writeLine("(AT+startMQTT?host=13.58.53.42&port=1883&clientId=100&username=omlxmgsy&password=AoGUfQNPkeSH)");
        while (true) {
            serial.writeLine("(AT+write_sensor_data?p0=" + pins.analogReadPin(AnalogPin.P0) + "&p1=" + pins.analogReadPin(AnalogPin.P1) + "&p2=" + pins.analogReadPin(AnalogPin.P2) + ")")
            basic.pause(500)
        }
    }

    //%subcategory=More
    //% blockId=wifi_ext_board_general_mqtt
    //% block="Connect MQTT server %host| port %port| client id %clientId| username %username| password %pwd"
    //% weight=50
    //% blockGap=7	
    export function connectgeneralMQTT(host: string, port: string, clientId: string, username: string, pwd: string): void {
        serial.writeLine("(AT+startMQTT?host=" + host + "&port=" + port + "&clientId=" + clientId + "&username=" + username + "&password=" + pwd + ")");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_mqtt_publish
    //% block="MQTT publish topic %topic| payload %payload"
    //% weight=45	
    //% blockGap=7	
    export function mqttPublish(topic: string, payload: string): void {
        serial.writeLine("(AT+mqttPub?topic=" + topic + "&payload=" + payload + ")");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_mqtt_subscribe
    //% block="MQTT subscribe topic %topic"
    //% weight=40
    export function mqttSubscribe(topic: string): void {
        serial.writeLine("(AT+mqttSub?topic=" + topic + ")");
    }

    // -------------- 6. General ----------------		

    //%subcategory=More
    //%blockId=wifi_ext_board_battery
    //%block="Get battery level"
    //% weight=35
    //% blockGap=7		

    export function sendBattery(): void {
        serial.writeLine("(AT+battery)");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_version
    //%block="Get firmware version"
    //% weight=30	
    //% blockGap=7		
    export function sendVersion(): void {
        serial.writeLine("(AT+version)");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_at
    //%block="Send AT command %command"
    //% weight=25	
    //% blockGap=7		
    export function sendAT(command: string): void {
        serial.writeLine(command);
        flag = false
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_test
    //%block="Send AT test"
    //% weight=20	
    //% blockGap=7		
    export function sendTest(): void {
        serial.writeLine("(AT+testing)");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_deep_sleep
    //%block="Set deep sleep %second| second"
    //% weight=15	
    //% blockGap=7	
    export function setDeepSleep(second: number): void {
        serial.writeLine("(AT+deepsleep?time=" + second + ")");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_forever_sleep
    //%block="Soft trun off"
    //% weight=10	
    export function setTurnOff(): void {
        serial.writeLine("(AT+deepsleep?time=0)");
    }

}

