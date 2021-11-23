#include <Servo.h>
#include <string.h>

Servo myServo;

String incomingString = ""; // for incoming serial data
String nullString = "";
int servoPin = 5;
int i=0;

// Setup for light
int GREEN = A0;
int RED = A1;

void setup() {

  Serial.begin(9600); // opens serial port, sets data rate to 9600 bps
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(RED, OUTPUT);
  
  // Attach the Servo Motor
  myServo.attach(servoPin);
  
  // Set Servo to close lid
  myServo.write(0);

  // Test Lights
  for(i=0;i<20;i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    digitalWrite(GREEN, HIGH);
    delay(200);
    digitalWrite(LED_BUILTIN, LOW);
    digitalWrite(GREEN, LOW);
  }        

  myServo.write(20);
  delay(1000);
  myServo.write(0);
  
}

void loop() {
  // Set light to be red
  
  // send data only when you receive data:
  if (Serial.available() > 0) {
    // read the incoming byte:
    incomingString = Serial.readString();
      if (incomingString.compareTo(nullString)) {
        incomingString = "";

        // Set Light to be Green
        int j = 0;
        for(j=0;j<6;j++) {
   
          // Blink a few times
          digitalWrite(LED_BUILTIN, HIGH);
          digitalWrite(GREEN, HIGH);
          delay(500);

          digitalWrite(LED_BUILTIN, LOW);
          digitalWrite(GREEN, LOW);
          delay(500);
   
        }

        digitalWrite(LED_BUILTIN, HIGH);
        digitalWrite(GREEN, HIGH);
                  
        int pos = 0;
        for (pos=0;pos <=68; pos+=1) {
          myServo.write(pos);
          delay(40);
        }
        delay(20000);
        for (pos=68;pos >=0; pos-=1) {
          myServo.write(pos);
          delay(40);
        }

        digitalWrite(LED_BUILTIN, LOW);
        digitalWrite(GREEN, LOW);
        
    }
  }
}
