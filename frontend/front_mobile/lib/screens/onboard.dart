import 'package:flutter/material.dart';
import 'package:front_mobile/screens/signin_screen.dart';

class OnboardScreen extends StatefulWidget {
  OnboardScreen({Key? key}) : super(key: key);

  @override
  State<OnboardScreen> createState() => _OnboardScreenState();
}

class _OnboardScreenState extends State<OnboardScreen> {
  int currentIndex = 0;
  final PageController _pageController = PageController();

  List<AllinOnboardModel> allinonboardlist = [
    AllinOnboardModel(
      "assets/images/bg22.png",
      "Easily create custom marketing campaigns with AI-generated content (text, images, videos, audio) tailored to your audience and goals",
      "Advanced Personalization",
    ),
    AllinOnboardModel(
      "assets/images/design2.png",
      "Leverage predictive analytics and performance tools to optimize strategies and maximize campaign impact.",
      "Valuable Insights",
    ),
    AllinOnboardModel(
      "assets/images/design1.png",
      "Enjoy an intuitive interface and robust infrastructure with fast access via a dedicated REST API for measurable results",
      "Simplicity and Efficiency",
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(
          "Market Mind",
          style: TextStyle(
            fontSize: 30.0,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.transparent,
      ),
      backgroundColor: Color(0xFF01013E),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        margin: EdgeInsets.only(top: 40.0),
        padding: EdgeInsets.only(top: 80.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(130.0),  // Radius pour le coin supérieur gauche
          ),
        ),
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              onPageChanged: (value) {
                setState(() {
                  currentIndex = value;
                });
              },
              itemCount: allinonboardlist.length,
              itemBuilder: (context, index) {
                return PageBuilderWidget(
                  title: allinonboardlist[index].titlestr,
                  description: allinonboardlist[index].description,
                  imgurl: allinonboardlist[index].imgStr,
                );
              },
            ),
            // Modifier la position des dots, maintenant ils sont au-dessus du bouton
            Positioned(
              bottom: MediaQuery.of(context).size.height * 0.15,  // Ajuster la distance du bouton
              left: MediaQuery.of(context).size.width * 0.44,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  allinonboardlist.length,
                  (index) => buildDot(index: index),
                ),
              ),
            ),
            Positioned(
              bottom: MediaQuery.of(context).size.height * 0.05,  // Placer le bouton "Get Started" plus bas
              left: MediaQuery.of(context).size.width * 0.26,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => SignInScreen(),
                    ),
                  );
                },
                child: Text(
                  "Get Started",
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF01013E),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                  padding: EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  AnimatedContainer buildDot({int? index}) {
    return AnimatedContainer(
      duration: kAnimationDuration,
      margin: EdgeInsets.only(right: 5),
      height: 6,
      width: currentIndex == index ? 20 : 6,
      decoration: BoxDecoration(
        color: currentIndex == index ? Color(0xFF01013E) : Color(0xFFD8D8D8),
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }
}

class PageBuilderWidget extends StatelessWidget {
  final String title;
  final String description;
  final String imgurl;

  PageBuilderWidget({
    Key? key,
    required this.title,
    required this.description,
    required this.imgurl,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(left: 15, right: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 20),
            child: Image.asset(imgurl),
          ),
          const SizedBox(
            height: 20,
          ),
          Text(
            title,
            style: TextStyle(
              color: primarygreen,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Text(
            description,
            textAlign: TextAlign.justify,
            style: TextStyle(
              color: primarygreen,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class AllinOnboardModel {
  final String imgStr;
  final String description;
  final String titlestr;

  AllinOnboardModel(this.imgStr, this.description, this.titlestr);
}

// Colors and Constants
const Color lightgreenshede = Color(0xFFF0FAF6);
const Color lightgreenshede1 = Color(0xFFB2D9CC);
const Color primarygreen = Color(0xFF1E3A34);
const Duration kAnimationDuration = Duration(milliseconds: 200);
