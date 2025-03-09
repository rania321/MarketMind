import 'package:flutter/material.dart';
import 'package:front_mobile/constants/colors.dart';
import 'package:front_mobile/widgets/custom_app_bar.dart';
import 'package:front_mobile/widgets/custom_drawer.dart';
import 'package:front_mobile/widgets/custom_navigation_bar.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0; // Index pour la Navigation Bar

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: "Mon Application"), // AppBar personnalisée
      drawer: CustomDrawer(), // Drawer personnalisé
      body: Center(
        child: Text(
          'Page d\'accueil',
          style: TextStyle(fontSize: 24, color: AppColors.black), // Texte en noir
        ),
      ),
      bottomNavigationBar: CustomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ), // Navigation Bar personnalisée
    );
  }
}