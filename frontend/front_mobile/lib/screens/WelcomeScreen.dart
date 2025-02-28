import 'package:flutter/material.dart';
import 'package:front_mobile/screens/onboard.dart';
import 'package:front_mobile/widgets/custom_scaffold.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    // Configurer l'animation
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 5), // Durée de l'animation
    )..forward();

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _scaleAnimation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    // Rediriger vers la page de connexion après 3 secondes
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => OnboardScreen()),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose(); // Libérer les ressources
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      child: Center( // Centrage global
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center, // Centre l'image verticalement
          children: [
            Expanded(
              child: Center(
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: Image.asset(
                      'assets/images/logo1.png', // Remplace par ton image
                      width: 300, // Augmente la taille
                      height: 300,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}




          // Flexible(
          //   flex: 1,
          //   child: Align(
          //     alignment: Alignment.bottomRight,
          //     child: Row(
          //       children: [
          //         Expanded(
          //           child: WelcomeButton(
          //             buttonText: 'Sign in',
          //             onTap: const SignInScreen(),
          //             color: Colors.transparent,
          //             textColor: Colors.white,
          //             borderRadius: 0.0,
          //             elevation: 0.0,
          //           ),
          //         ),
          //         Expanded(
          //           child: WelcomeButton(
          //             buttonText: 'Sign up',
          //             onTap: const SignUpScreen(),
          //             color: Colors.white,
          //             textColor: lightColorScheme.primary,
          //             borderRadius: 0.0,
          //             elevation: 0.0,
          //           ),
          //         ),
          //       ],
          //     ),
          //   ),
          // ),
       
