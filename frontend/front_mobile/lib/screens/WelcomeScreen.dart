import 'package:flutter/material.dart';
import 'package:front_mobile/screens/onboard.dart';
import 'package:front_mobile/screens/signin_screen.dart';
import 'package:front_mobile/screens/signup_screen.dart';
import 'package:front_mobile/theme/theme.dart';
import 'package:front_mobile/widgets/custom_scaffold.dart';
import 'package:front_mobile/widgets/welcome_button.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    // Configurer l'animation
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2), // Durée de l'animation
    )..forward();

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    // Rediriger vers la page de connexion après 3 secondes
    Future.delayed(const Duration(seconds: 3), () {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => OnboardScreen()),
      );
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
      child: Column(
        children: [
          Flexible(
            flex: 8,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 0,
                  horizontal: 40.0,
                ),
                child: Center(
                  child: RichText(
                    textAlign: TextAlign.center,
                    text: const TextSpan(
                      children: [
                        TextSpan(
                          text: 'Market Mind!\n',
                          style: TextStyle(
                            fontSize: 45.0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                       
                        TextSpan(
                          text:
                              '\n Elevate your marketing with AI-driven innovation',
                          style: TextStyle(
                            fontSize: 20,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
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
        ],
      ),
    );
  }
}
