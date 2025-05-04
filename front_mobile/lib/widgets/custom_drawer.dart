import 'package:flutter/material.dart';
import 'package:front_mobile/screens/ProductScreen.dart';
import 'package:front_mobile/screens/signin_screen.dart';
import '../constants/colors.dart';

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.75, // Largeur adaptative
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(16)),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.white,
              Colors.white,
              AppColors.blue.withOpacity(0.1),
            ],
          ),
        ),
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            _buildHeader(context),
            _buildMenuItems(context),
            _buildFooter(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return UserAccountsDrawerHeader(
      decoration: BoxDecoration(
        color: AppColors.blue,
        borderRadius: const BorderRadius.only(
          bottomRight: Radius.circular(16),
        ),
      ),
      accountName: Text(
        "BrandBoost",
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: Colors.white,
          fontSize: 18,
        ),
      ),
      accountEmail: Text(
        "Premium Member",
        style: TextStyle(
          color: Colors.white.withOpacity(0.8),
        ),
      ),
      currentAccountPicture: CircleAvatar(
        backgroundColor: Colors.white,
        child: Image.asset(
          'assets/images/logo1.png', 
          height: 40,
        ),
      ),
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    return Column(
      children: [
        _createDrawerItem(
          icon: Icons.dashboard,
          text: "Dashboard",
          onTap: () => _navigateTo(context, '/home'),
        ),
         _createDrawerItem(
          icon: Icons.shopping_bag,
          text: "Products",
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ProductScreen()),
          ),
        ),
        _createDrawerItem(
          icon: Icons.analytics,
          text: "Analytics",
          onTap: () => _navigateTo(context, '/analytics'),
        ),
        _createDrawerItem(
          icon: Icons.content_paste,
          text: "Content Generator",
          onTap: () => _navigateTo(context, '/content'),
        ),
        _createDrawerItem(
          icon: Icons.insights,
          text: "Customer Insights",
          onTap: () => _navigateTo(context, '/insights'),
        ),
        _createDrawerItem(
          icon: Icons.campaign,
          text: "Marketing Strategies",
          onTap: () => _navigateTo(context, '/strategies'),
        ),
        const Divider(height: 20, thickness: 1),
        _createDrawerItem(
          icon: Icons.settings,
          text: "Settings",
          onTap: () => _navigateTo(context, '/settings'),
        ),
        _createDrawerItem(
          icon: Icons.help_center,
          text: "Help & Support",
          onTap: () => _navigateTo(context, '/help'),
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const Divider(),
          
          const SizedBox(height: 8),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout, size: 16),
            label: const Text("Logout"),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.red,
              side: BorderSide(color: AppColors.red),
            ),
            onPressed: () {
                _showLogoutConfirmation(context);
            },
          ),
        ],
      ),
    );
  }

  Widget _createDrawerItem({
    required IconData icon,
    required String text,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: AppColors.blue.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.blue),
      ),
      title: Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
      onTap: onTap,
    );
  }

  void _navigateTo(BuildContext context, String routeName) {
    Navigator.pop(context); // Ferme le drawer
    Navigator.pushNamed(context, routeName); // Navigue vers la route
  }

  void _showLogoutConfirmation(BuildContext context) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text("Confirm Logout"),
      content: const Text("Are you sure you want to log out?"),
      actions: [
        // Cancel Button - stays on current page
        TextButton(
          onPressed: () => Navigator.of(context).pop(), // Just closes the dialog
          child: const Text("Cancel"),
        ),
        // Log Out Button - redirects to login
        FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.red,
          ),
          onPressed: () {
            // Close the dialog first
            Navigator.of(context).pop();
            
            // Perform logout operations (clear tokens, etc.)
            _performLogout();
            
            // Navigate to login screen with route replacement
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => SignInScreen()),
              (Route<dynamic> route) => false,
            );
          },
          child: const Text("Log Out"),
        ),
      ],
    ),
  );
}

void _performLogout() {
  // Add your actual logout logic here:
  // - Clear authentication tokens
  // - Reset user data
  // - Clear any cached data
  // Example:
  // authService.logout();
  // userData.clear();
}
}