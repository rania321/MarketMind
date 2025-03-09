import 'package:flutter/material.dart';
import '../constants/colors.dart'; // Importez les couleurs

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;

  const CustomAppBar({Key? key, required this.title}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: TextStyle(color: AppColors.black), // Texte en noir
      ),
      backgroundColor: AppColors.blue, // Fond de l'AppBar en bleu
      centerTitle: true, // Centrer le titre
      iconTheme: IconThemeData(color: AppColors.black), // Icônes en noir
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight); // Hauteur par défaut de l'AppBar
}