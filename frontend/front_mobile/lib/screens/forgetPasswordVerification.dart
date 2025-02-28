import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_otp_text_field/flutter_otp_text_field.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:front_mobile/screens/WelcomeScreen.dart';

class ForgotPasswordVerification extends StatefulWidget {
  final String phoneNumber;
  ForgotPasswordVerification({super.key, required this.phoneNumber});

  @override
  State<ForgotPasswordVerification> createState() => _ForgotPasswordVerificationState();
}

class _ForgotPasswordVerificationState extends State<ForgotPasswordVerification> {
  bool _pinSuccess = false;
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.of(context).size;
    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          height: size.height,
          width: size.width,
          decoration: BoxDecoration(
              image: DecorationImage(
                  image: AssetImage("assets/images/back.png"),
                  fit: BoxFit.fitHeight)),
          child: Column(
            children: [
              SizedBox(
                height: MediaQuery.of(context).size.height / 4,
              ),
              Center(
                child: Container(
                  height: 100,
                  width: 100,
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Color(0xFF01013E),
                        width: 4,
                      )),
                  alignment: Alignment.center,
                  child: ClipOval(
                    child: Icon(
                      Icons.privacy_tip_outlined,
                      size: 60,
                      color: Color(0xFF01013E),
                    ),
                  ),
                ),
              ),
              Container(
                margin: EdgeInsets.fromLTRB(50, 50, 0, 0),
                child: Column(
                  children: [
                    Container(
                        alignment: Alignment.topLeft,
                        child: Text("Verification",
                            style: TextStyle(
                                color: Colors.black54,
                                fontWeight: FontWeight.bold,
                                fontSize: 35))),
                    SizedBox(height: 10),
                    Text(
                      "Enter the verification code we just sent to",
                      style: TextStyle(
                          color: Colors.black54,
                          fontWeight: FontWeight.bold,
                          fontSize: 16),
                    ),
                    SizedBox(height: 10),
                    Container(
                      alignment: Alignment.centerLeft,
                      child: Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: "******" + widget.phoneNumber.substring(widget.phoneNumber.length - 3) + "\t",
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 16),
                            ),
                            TextSpan(
                              text: " Change your number?",
                              style: TextStyle(
                                color: Color(0xFF01013E),
                                fontWeight: FontWeight.bold,
                                fontSize: 16),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () {
                                  Navigator.pop(context);
                                },
                            ),
                          ]
                        )
                      ),
                    ),
                    Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            Container(
                              alignment: Alignment.topLeft,
                              child: SizedBox(
                                  height: 70,
                                  width: 300,
                                  child: OtpTextField(
                                    showFieldAsBox: false,
                                    numberOfFields: 4,
                                    fieldWidth: 50,
                                    textStyle: TextStyle(fontSize: 30),
                                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                                    onSubmit: (pin) {
                                      setState(() {
                                         _pinSuccess = true;
                                      });
                                    },
                                  ))),
                            SizedBox(height: 20),
                            Container(
                              alignment: Alignment.centerLeft,
                              child: Text.rich(
                                TextSpan(
                                  children: [
                                    TextSpan(text: "Didn't receive a code? "),
                                    TextSpan(
                                      text: 'Resend',
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          addToast("Verification code resent successfully.");
                                        },
                                      style: TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                  ]
                                )
                              ),
                            ),
                            SizedBox(height: 20),
                            Container(
                              alignment: Alignment.center,
                              margin: EdgeInsets.fromLTRB(0, 0, 70, 0),
                              child: SizedBox(
                                width: 170,
                                height: 60,
                                child: ElevatedButton(
                                    onPressed: () {
                                     Navigator.of(context).pushAndRemoveUntil(
                                       MaterialPageRoute(builder: (BuildContext context) => WelcomeScreen()),
                                       (route) => false);
                                    },
                                    child: Text(
                                      "Verify",
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 17),
                                    ),
                                    style: ButtonStyle(
                                        backgroundColor:
                                            MaterialStateProperty.all(
                                                Color(0xFF01013E)),
                                        shape: MaterialStateProperty.all(
                                            RoundedRectangleBorder(
                                                borderRadius: BorderRadius.all(
                                                    Radius.circular(50)))))),
                              ),
                            ),
                          ],
                        ))
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  void addToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Colors.black,
      textColor: Colors.white,
    );
  }
}
