import 'package:flutter/material.dart';
import 'package:front_mobile/constants/colors.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final bool showNotificationIcon;
  final VoidCallback? onNotificationPressed;

  const CustomAppBar({
    Key? key,
    required this.title,
    this.subtitle,
    this.showNotificationIcon = true,
    this.onNotificationPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.3),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(20),
        ),
      ),
      title: Center( // Ajout d'un widget Center supplémentaire
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: AppColors.black,
                fontWeight: FontWeight.w600,
                fontSize: 20,
              ),
            ),
            if (subtitle != null)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  subtitle!,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ),
          ],
        ),
      ),
      centerTitle: true, // Assure le centrage même avec des actions
      actions: [
        if (showNotificationIcon)
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: IconButton(
              icon: Stack(
                children: [
                  const Icon(
                    Icons.notifications_outlined,
                    color: AppColors.blue,
                    size: 26,
                  ),
                  Positioned(
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: AppColors.red,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white,
                          width: 1.5,
                        ),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 12,
                        minHeight: 12,
                      ),
                    ),
                  ),
                ],
              ),
              onPressed: onNotificationPressed ?? () {},
            ),
          ),
      ],
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
        subtitle != null ? kToolbarHeight + 30 : kToolbarHeight + 20,
      );
}