namespace IoT {
    let flag = true;
    let httpReturnArray: string[] = []
    let inbound1 = ""
    let inbound2 = ""
    let outbound1 = ""
    let outbound2 = ""

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
    //% weight=90	
    //% blockGap=7	
    export function initializeWifi(): void {
        serial.redirect(SerialPin.P16, SerialPin.P8, BaudRate.BaudRate115200);
        MuseOLED.init(32, 128)

        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
            let temp = serial.readLine()
            let tempDeleteFirstCharacter = ""

            if (temp.charAt(0).compare("#") == 0) {
                tempDeleteFirstCharacter = temp.substr(1, 20)
                httpReturnArray.push(tempDeleteFirstCharacter)
            } else if (temp.charAt(0).compare("*") == 0) {

                // For digital, pwm, servo
                let mode = temp.substr(1, 1)
                let intensity = 0
                let pin = 0

                // For motor and car
                let motor = 0
                let direction = 0

                // For control 2 motor same time mode
                let direction1 = 0
                let direction2 = 0
                let intensity1 = 0
                let intensity2 = 0

                if (mode == "0") {	//digital
                    pin = parseInt(temp.substr(3, 2))
                    intensity = parseInt(temp.substr(2, 1))

                    pins.digitalWritePin(pin, intensity)
                } else if (mode == "1") { //pwm
                    pin = parseInt(temp.substr(5, 2))
                    intensity = pins.map(parseInt(temp.substr(2, 3)), 100, 900, 0, 1023)

                    pins.analogWritePin(pin, intensity)
                } else if (mode == "2") { //servo
                    pin = parseInt(temp.substr(5, 2))
                    intensity = pins.map(parseInt(temp.substr(2, 3)), 100, 900, 0, 180)

                    pins.servoWritePin(pin, intensity)
                } else if (mode == "3") { //motor
                    motor = parseInt(temp.substr(6, 1))
                    direction = parseInt(temp.substr(5, 1))
                    intensity = pins.map(parseInt(temp.substr(2, 3)), 100, 900, 0, 100)

                //    MuseRover.motorOn(motor, direction, intensity)
                } else if (mode == "4") { //car
                    direction = parseInt(temp.substr(5, 1))
                    intensity = pins.map(parseInt(temp.substr(2, 3)), 100, 900, 0, 100)

                    if (direction == 0) {
                    //   MuseRover.motorOn(0, 0, intensity)
                    //   MuseRover.motorOn(1, 0, intensity)
                    } else if (direction == 1) {
                    //   MuseRover.motorOn(0, 1, intensity)
                    //   MuseRover.motorOn(1, 1, intensity)
                    } else if (direction == 2) {
                    //    MuseRover.motorOn(0, 1, intensity)
                    //    MuseRover.motorOn(1, 0, 0)
                    } else if (direction == 3) {
                    //    MuseRover.motorOn(0, 0, 0)
                    //    MuseRover.motorOn(1, 1, intensity)
                    } else if (direction == 4) {
                    //    MuseRover.motorOn(0, 0, intensity)
                    //    MuseRover.motorOn(1, 0, intensity)
                    }
                } else if (mode == "5") { //motor_2
                    direction1 = parseInt(temp.substr(5, 1))
                    intensity1 = pins.map(parseInt(temp.substr(2, 3)), 100, 900, 0, 100)
                    direction2 = parseInt(temp.substr(9, 1))
                    intensity2 = pins.map(parseInt(temp.substr(6, 3)), 100, 900, 0, 100)

                //    MuseRover.motorOn(0, direction1, intensity1)
                //    MuseRover.motorOn(1, direction2, intensity2)

                }

                //basic.showNumber(pin)
                //basic.showNumber(intensity)

            } else if (temp.charAt(0).compare("$") == 0) {
                let no = parseInt(temp.substr(1, 1))
                let string_word = temp.substr(2, 20)

                if (no == 1) {
                    inbound1 = string_word
                } else if (no == 2) {
                    inbound2 = string_word
                }

            } else {
                MuseOLED.showString(temp)
            }
        })

        basic.pause(5000);
    }

    // -------------- 2. WiFi ----------------
    //% blockId=wifi_ext_board_set_wifi
    //% block="Set wifi to ssid %ssid| pwd %pwd"   
    //% weight=80	
    export function setWifi(ssid: string, pwd: string): void {
        serial.writeLine("(AT+wifi?ssid=" + ssid + "&pwd=" + pwd + ")");
    }

    // -------------- 3. Cloud ----------------
    //% blockId=wifi_ext_board_set_thingspeak
    //% block="Send Thingspeak key* %key|field1 %field1|field2 %field2|field3 %field3"
    //% weight=70	
    //% blockGap=7	
    export function sendThingspeak(key: string, field1: number, field2: number, field3: number): void {
        serial.writeLine("(AT+thingspeak?key=" + key + "&field1=" + field1 + "&field2=" + field2 + "&field3=" + field3 + ")");
    }

    // -------------- 3. Cloud ----------------

    //% blockId=wifi_ext_board_set_ifttt
    //% block="Send IFTTT key* %key|event_name* %event|value1 %value1|value2 %value2|value3 %value3"
    //% weight=60
    //% blockGap=7		
    export function sendIFTTT(key: string, eventname: string, value1: number, value2: number, value3: number): void {
        serial.writeLine("(AT+ifttt?key=" + key + "&event=" + eventname + "&value1=" + value1 + "&value2=" + value2 + "&value3=" + value3 + ")");
    }

    // -------------- 4. Others ----------------
    //% blockId=wifi_ext_board_set_wifi_hotspot
    //% block="Set hotspot to ssid %ssid| pwd %pwd"   
    //% weight=58	
    //% blockGap=7	
    export function setWifiHotspot(ssid: string, pwd: string): void {
        serial.writeLine("(AT+wifi_hotspot?ssid=" + ssid + "&pwd=" + pwd + ")");
    }

    //%blockId=wifi_ext_board_start_server_LAN
    //%block="Start WiFi remote control (LAN)"
    //% weight=56
    //% blockGap=7		
    export function startWebServer_LAN(): void {
        flag = true
        serial.writeLine("(AT+startWebServer)")
        while (flag) {
            serial.writeLine("(AT+write_sensor_data?p0=" + pins.analogReadPin(AnalogPin.P0) + "&p1=" + pins.analogReadPin(AnalogPin.P1) + "&p2=" + pins.analogReadPin(AnalogPin.P2) + "&outbound1=" + outbound1 + "&outbound2=" + outbound2 + ")")
            basic.pause(500)
            if (!flag)
                break;
        }

    }
	
	//%blockId=wifi_ext_board_start_server_WAN
    //%block="Start WiFi remote control (WAN)"
    //% weight=55
    //% blockGap=7		
    export function startWebServer_WAN(): void {
        flag = true
        serial.writeLine("(AT+startWebServer)")
        while (flag) {
            serial.writeLine("(AT+write_sensor_data?p0=" + pins.analogReadPin(AnalogPin.P0) + "&p1=" + pins.analogReadPin(AnalogPin.P1) + "&p2=" + pins.analogReadPin(AnalogPin.P2) + "&outbound1=" + outbound1 + "&outbound2=" + outbound2 + ")")
            basic.pause(500)
            if (!flag)
                break;
        }

    }

    //%blockId=wifi_ext_board_initialize_wifi_normal
    //%block="Initialize Wifi Extension Board"
    //% weight=54	
    export function initializeWifiNormal(): void {
        serial.redirect(SerialPin.P16, SerialPin.P8, BaudRate.BaudRate115200);
    }

    // -------------- 5. Advanced Wifi ----------------

    //%subcategory=More
    //%blockId=wifi_ext_board_generic_http
    //% block="Send generic HTTP method %method| http://%url| header %header| body %body"
    //% weight=50
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
    //% weight=49
    //% blockGap=7	

    export function getGenericHttpReturn(): Array<string> {
        return httpReturnArray;
    }

    //%subcategory=More
    //% blockId="wifi_ext_board_http_inbound" 
    //% block="HTTP inbound %no"
    //% weight=48
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
    //% weight=47	
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
    //% weight=46

    export function changetostring(no: number): string {

        return no.toString();
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_muse_mqtt
    //%block="Connect to Muse MQTT server"
    //% weight=44
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
    //% weight=43
    //% blockGap=7	
    export function connectgeneralMQTT(host: string, port: string, clientId: string, username: string, pwd: string): void {
        serial.writeLine("(AT+startMQTT?host=" + host + "&port=" + port + "&clientId=" + clientId + "&username=" + username + "&password=" + pwd + ")");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_mqtt_publish
    //% block="MQTT publish topic %topic| payload %payload"
    //% weight=42	
    //% blockGap=7	
    export function mqttPublish(topic: string, payload: string): void {
        serial.writeLine("(AT+mqttPub?topic=" + topic + "&payload=" + payload + ")");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_mqtt_subscribe
    //% block="MQTT subscribe topic %topic"
    //% weight=41	
    export function mqttSubscribe(topic: string): void {
        serial.writeLine("(AT+mqttSub?topic=" + topic + ")");
    }

    // -------------- 6. General ----------------		

    //%subcategory=More
    //%blockId=wifi_ext_board_battery
    //%block="Get battery level"
    //% weight=40
    //% blockGap=7		

    export function sendBattery(): void {
        serial.writeLine("(AT+battery)");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_version
    //%block="Get firmware version"
    //% weight=39	
    //% blockGap=7		
    export function sendVersion(): void {
        serial.writeLine("(AT+version)");
    }

    //%subcategory=More
    //%blockId=wifi_ext_board_at
    //%block="Send AT command %command"
    //% weight=30	
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
    //% weight=14	
    export function setTurnOff(): void {
        serial.writeLine("(AT+deepsleep?time=0)");
    }

}




