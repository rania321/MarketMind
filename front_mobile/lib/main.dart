import 'package:flutter/material.dart';
import 'package:front_mobile/screens/WelcomeScreen.dart';
import 'package:front_mobile/theme/theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Marketing App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        colorScheme: ColorScheme.fromSwatch(
          primarySwatch: Colors.blue,
          accentColor: Colors.red, // Couleur d'accentuation rouge
        ),
      ),
      home: const WelcomeScreen(),
    );
  }
}
