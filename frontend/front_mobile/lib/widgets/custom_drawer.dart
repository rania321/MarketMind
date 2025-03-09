import 'package:flutter/material.dart';
import '../constants/colors.dart'; // Importez les couleurs

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: AppColors.blue, // Fond du header en bleu
            ),
            child: Text(
              'Menu',
              style: TextStyle(
                color: AppColors.black, // Texte en noir
                fontSize: 24,
              ),
            ),
          ),
          ListTile(
            leading: Icon(Icons.home, color: AppColors.black), // Icône en noir
            title: Text(
              'Accueil',
              style: TextStyle(color: AppColors.black), // Texte en noir
            ),
            onTap: () {
              // Naviguer vers la page d'accueil
              Navigator.pop(context);
            },
          ),
          ListTile(
            leading: Icon(Icons.settings, color: AppColors.black), // Icône en noir
            title: Text(
              'Paramètres',
              style: TextStyle(color: AppColors.black), // Texte en noir
            ),
            onTap: () {
              // Naviguer vers la page des paramètres
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
}