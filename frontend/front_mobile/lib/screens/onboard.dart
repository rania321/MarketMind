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
    "assets/images/logo1.png",
    "Automatically analyze customer reviews and extract actionable insights to improve your product and customer experience",
    "Smart Review Analysis",
  ),
  AllinOnboardModel(
    "assets/images/logo1.png",
    "Get data-driven marketing strategy recommendations tailored to your audience's needs and preferences",
    "Smart Strategy Builder",
  ),
  AllinOnboardModel(
    "assets/images/logo1.png",
    "Generate personalized marketing content (text, visuals) based on trends identified in customer feedback",
    "AI Content Creation",
  ),
];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
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
          // Bouton "Skip" en haut à droite (uniquement pour les deux premières pages)
          if (currentIndex != allinonboardlist.length - 1)
            Positioned(
              top: 40, // Position en haut
              right: 20, // Position à droite
              child: TextButton(
                onPressed: () {
                  // Redirection vers l'écran SignInScreen
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => SignInScreen(),
                    ),
                  );
                },
                child: Text(
                  "Skip",
                  style: TextStyle(
                    color: Color(0xFF04a4ed), // Couleur bleue
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          // Indicateurs de page
          Positioned(
            bottom: 100, // Position des indicateurs au-dessus des boutons
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                allinonboardlist.length,
                (index) => buildDot(index: index),
              ),
            ),
          ),
          // Bouton en bas de la page
          Positioned(
            bottom: 20, // Position du bouton en bas
            left: 0,
            right: 0,
            child: currentIndex != allinonboardlist.length - 1
                ? Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 50),
                    child: ElevatedButton(
                      onPressed: () {
                        // Action pour Next
                        _pageController.nextPage(
                          duration: Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFFfe3f40), // Couleur rouge
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                        minimumSize: Size(double.infinity, 50), // Largeur maximale
                      ),
                      child: Text(
                        "Next",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  )
                : Center(
                    child: ElevatedButton(
                      onPressed: () {
                        // Action pour Let's Go
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => SignInScreen(), // Remplacez par votre écran de connexion
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFFfe3f40), // Couleur rouge
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 100, vertical: 15),
                      ),
                      child: Text(
                        "Let's Go",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  AnimatedContainer buildDot({int? index}) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 200),
      margin: EdgeInsets.only(right: 5),
      height: 6,
      width: currentIndex == index ? 20 : 6,
      decoration: BoxDecoration(
        color: currentIndex == index ? Color(0xFFfe3f40) : Color(0xFF000000),
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
            margin: const EdgeInsets.only(top: 100),
            child: Image.asset(imgurl),
          ),
          const SizedBox(
            height: 40,
          ),
          Text(
            title,
            style: TextStyle(
              color: Color(0xFF000000),
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Text(
            description,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF000000),
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