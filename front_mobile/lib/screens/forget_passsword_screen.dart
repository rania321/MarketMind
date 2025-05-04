import 'package:front_mobile/screens/forgetPasswordVerification.dart';
import 'package:front_mobile/screens/signin_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter/src/widgets/container.dart';
import 'package:flutter/src/widgets/framework.dart';

class ForgetPass extends StatefulWidget {
  const ForgetPass({super.key});

  @override
  State<ForgetPass> createState() => _ForgetPassState();
}

class _ForgetPassState extends State<ForgetPass> {
  final _formKey = GlobalKey<FormState>();
  TextEditingController number = TextEditingController();

  verificationPass() {
    if (_formKey.currentState!.validate()) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => ForgotPasswordVerification(
            phoneNumber: number.text,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.of(context).size;
    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          height: size.height,
          width: size.width,
          child: Column(
            children: [
              SizedBox(height: MediaQuery.of(context).size.height / 4),
              Center(
                child: Container(
                  height: 100,
                  width: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Color(0xFF01013E),
                      width: 4,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: ClipOval(
                    child: Icon(
                      Icons.password,
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
                      child: Text(
                        "Forgot Password?",
                        style: TextStyle(
                          color: Colors.black54,
                          fontWeight: FontWeight.bold,
                          fontSize: 35,
                        ),
                      ),
                    ),
                    SizedBox(height: 10),
                    Text(
                      "Enter the mobile phone number associated with your account.",
                      style: TextStyle(
                        color: Colors.black54,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    SizedBox(height: 10),
                    Text(
                      "We will send you a verification code to verify your identity.",
                      style: TextStyle(color: Colors.black54),
                    ),
                    SizedBox(height: 20),
                    Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          Container(
                            alignment: Alignment.topLeft,
                            child: SizedBox(
                              height: 70,
                              width: 300,
                              child: TextFormField(
                                controller: number,
                                decoration: InputDecoration(
                                  hintText: "Phone number",
                                  icon: Icon(
                                    Icons.phone,
                                    color: Color(0xFF01013E),
                                  ),
                                ),
                                keyboardType: TextInputType.phone,
                                validator: (value) {
                                  if (value!.isEmpty) {
                                    return "Enter your phone number";
                                  }
                                  if (!(value.isEmpty) &&
                                      ((value.length < 8) || (value.length > 8))) {
                                    return "Enter a valid phone number";
                                  }
                                  return null;
                                },
                              ),
                            ),
                          ),
                          SizedBox(height: 10),
                          Container(
                            alignment: Alignment.center,
                            margin: EdgeInsets.fromLTRB(0, 0, 70, 0),
                            child: SizedBox(
                              width: 170,
                              height: 60,
                              child: ElevatedButton(
                                onPressed: () {
                                  verificationPass();
                                },
                                child: Text(
                                  "SEND",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                style: ButtonStyle(
                                  backgroundColor:
                                      MaterialStateProperty.all(Color(0xFF01013E)),
                                  shape: MaterialStateProperty.all(
                                    RoundedRectangleBorder(
                                      borderRadius: BorderRadius.all(
                                        Radius.circular(50),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
