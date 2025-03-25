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
  int _currentIndex = 0;
  final String _appSlogan = "From Feedback to Fortune - AI-Powered Review Magic";
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
    title: "BrandBoost",
    showNotificationIcon: true, // Par défaut true
    onNotificationPressed: () {
      // Votre logique de notification
    },
  ),
      drawer: CustomDrawer(),
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Hero Section
            _buildHeroSection(),
            SizedBox(height: 24),

            // Value Proposition Cards
            _buildValuePropositions(),
            SizedBox(height: 24),

            // Key Metrics
            _buildKeyMetricsSection(),
            SizedBox(height: 24),

            // Recent Insights
            _buildRecentInsightsSection(),
            
            // Testimonial
            _buildTestimonialSection(),
          ],
        ),
      ),
      bottomNavigationBar: CustomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.blue.withOpacity(0.1), Colors.white],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          Image.asset(
      'assets/images/logo1.png',
      height: 100, // Taille augmentée (ajustez selon vos besoins)
      width: 100, // Conserver les proportions
      fit: BoxFit.contain,
    ),
          SizedBox(height: 16),
          Text(
            "Turn Customer Voices\nInto Marketing Gold",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.blue,
            ),
          ),
          SizedBox(height: 12),
          Text(
            "AI analyzes reviews, generates content, and recommends strategies\nwhile you focus on growth",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: AppColors.black),
          ),
          SizedBox(height: 20),
          FilledButton(
            onPressed: () {},
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.blue,
              padding: EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
            child: Text("Launch Analysis", style: TextStyle(fontSize: 18)),
          ),
        ],
      ),
    );
  }

  Widget _buildValuePropositions() {
  return Column(
    children: [
      Text(
        "Why Marketers Love Us",
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: AppColors.black,
        ),
      ),
      SizedBox(height: 16),
      Wrap(
        spacing: 16,
        runSpacing: 16,
        children: [
          _buildValueCard(
            Icons.insights,
            "Deep Insights",
            "Spot hidden customer needs and trends",
            AppColors.blue
          ),
          _buildValueCard(
            Icons.rocket_launch,
            "AI Strategies",
            "Data-driven marketing plans in minutes",
            AppColors.red
          ),
          _buildValueCard(
            Icons.content_copy,
            "Auto Content",
            "Generate posts, ads, and emails instantly",
            AppColors.blue
          ),
          _buildLogoCard(), // Nouvelle carte spéciale pour le logo
        ],
      ),
    ],
  );
}

Widget _buildLogoCard() {
  return Container(
    width: MediaQuery.of(context).size.width * 0.42,
    height: 180, // Même hauteur que les autres cartes
    alignment: Alignment.center, // Centrage du logo
    child: Image.asset(
      'assets/images/logo3.png',
      height: 250, // Taille augmentée (ajustez selon vos besoins)
      width: 250, // Conserver les proportions
      fit: BoxFit.contain,
    ),
  );
}

// Conservez votre _buildValueCard existant sans modification
  Widget _buildValueCard(dynamic icon, String title, String desc, Color color) {
  return Container(
    width: MediaQuery.of(context).size.width * 0.42,
    child: Card(
      elevation: 3,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            if (icon is IconData)
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 30, color: color),
              )
            else if (icon is String)
              Image.asset(
                icon,
                height: 100, // Taille ajustée pour l'équilibre visuel
                width: 100,
                fit: BoxFit.contain,
              ),
            SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            SizedBox(height: 8),
            Text(
              desc,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    ),
  );
}






  Widget _buildKeyMetricsSection() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        "Your Performance Dashboard",
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: AppColors.black,
        ),
      ),
      SizedBox(height: 16),
      LayoutBuilder(
        builder: (context, constraints) {
          return GridView.count(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: constraints.maxWidth > 400 ? 1.1 : 0.9,
            padding: EdgeInsets.only(bottom: 8), // Espace supplémentaire
            children: [
              _buildMetricCard("1,892", "Reviews Analyzed", Icons.reviews, AppColors.blue),
              _buildMetricCard("4.6", "Avg. Rating", Icons.star, AppColors.red),
              _buildMetricCard("83%", "Positive", Icons.sentiment_satisfied, AppColors.blue),
              _buildMetricCard("12", "Strategies", Icons.lightbulb, AppColors.red),
            ],
          );
        },
      ),
    ],
  );
}

Widget _buildMetricCard(String value, String label, IconData icon, Color color) {
  return Card(
    elevation: 2,
    margin: EdgeInsets.zero, // Supprime les marges par défaut
    child: Padding(
      padding: EdgeInsets.all(12), // Réduit le padding
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 28, color: color), // Taille d'icône réduite
          SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 22, // Taille de police réduite
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13, // Taille de police réduite
              overflow: TextOverflow.visible,
            ),
          ),
        ],
      ),
    ),
  );
}

  Widget _buildRecentInsightsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Latest Discoveries",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.black,
              ),
            ),
            TextButton(
              onPressed: () {},
              child: Text("View All", style: TextStyle(color: AppColors.blue)),
            ),
          ],
        ),
        SizedBox(height: 12),
        Card(
          elevation: 2,
          child: ListTile(
            leading: Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.blue.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.trending_up, color: AppColors.blue),
            ),
            title: Text("Price Sensitivity Detected"),
            subtitle: Text("Customers mention 'expensive' 23% more this month"),
            trailing: Icon(Icons.chevron_right),
          ),
        ),
        SizedBox(height: 8),
        Card(
          elevation: 2,
          child: ListTile(
            leading: Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.red.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.campaign, color: AppColors.red),
            ),
            title: Text("Promotion Opportunity"),
            subtitle: Text("Bundle suggestions increased 40% in reviews"),
            trailing: Icon(Icons.chevron_right),
          ),
        ),
      ],
    );
  }

  Widget _buildTestimonialSection() {
    return Container(
      margin: EdgeInsets.only(top: 24),
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(Icons.format_quote, size: 30, color: AppColors.blue),
          SizedBox(height: 16),
          Text(
            "BrandBoost helped us increase conversion by 32% by identifying pain points we completely missed in customer feedback.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, fontStyle: FontStyle.italic),
          ),
          SizedBox(height: 16),
          Text(
            "- Sarah K., Marketing Director",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          RatingBar(rating: 5, color: AppColors.blue),
        ],
      ),
    );
  }
}

// Add this widget class for the rating stars
class RatingBar extends StatelessWidget {
  final int rating;
  final Color color;
  
  const RatingBar({super.key, required this.rating, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) => 
        Icon(
          index < rating ? Icons.star : Icons.star_border,
          color: color,
          size: 20,
        ),
      ),
    );
  }
}