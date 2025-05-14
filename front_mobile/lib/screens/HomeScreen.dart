import 'package:flutter/material.dart';
import 'package:front_mobile/constants/colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeroSection(),
            _buildFeatureGrid(),
            _buildContentGenerationSection(),
            _buildDashboardShowcase(),
            _buildTestimonials(),
            _buildFinalCta(),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(),
    );
  }

  // === AppBar ===
  AppBar _buildAppBar() {
    return AppBar(
      title: const Text(
        'MARKETMIND',
        style: TextStyle(
          color: AppColors.black,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
        ),
      ),
      centerTitle: true,
      elevation: 0,
      backgroundColor: Colors.white,
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_none, color: AppColors.black),
          onPressed: () {},
        ),
      ],
    );
  }

  // === Hero Section ===
  Widget _buildHeroSection() {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 80, 24, 60),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.blue, Color(0xFF00C6FB)],
        ),
      ),
      child: Column(
        children: [
          // Logo/Illustration
          Container(
            width: 160,
            height: 160,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.auto_awesome, size: 60, color: Colors.white),
          ),
          const SizedBox(height: 40),
          
          // Titre
          const Text(
            "L'Intelligence Artificielle\nau Service de Votre Business",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 16),
          
          // Sous-titre
          const Text(
            "Analysez les sentiments clients et générez du contenu marketing performant en quelques clics",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              color: Colors.white,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 40),
          
          // Boutons
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildGradientButton("Commencer", Icons.rocket_launch),
              const SizedBox(width: 16),
              _buildWhiteOutlineButton("Voir la démo"),
            ],
          ),
        ],
      ),
    );
  }

  // === Feature Grid ===
  Widget _buildFeatureGrid() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Column(
        children: [
          const Text(
            "PASSER À L'ÈRE DATA-DRIVEN", 
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.blue,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Tout ce dont vous avez besoin\npour conquérir votre marché",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.black,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 60),
          
          // Grille de fonctionnalités
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 24,
            crossAxisSpacing: 24,
            childAspectRatio: 0.9,
            children: [
              _buildFeatureCard(
                Icons.sentiment_very_satisfied, 
                "Analyse Sentiments", 
                "Détectez les tendances émotionnelles dans les avis clients",
                [AppColors.blue, const Color(0xFF00C6FB)],
              ),
              _buildFeatureCard(
                Icons.auto_fix_high, 
                "Génération de Contenu", 
                "Posts réseaux, emails et scripts vidéo générés par IA",
                [const Color(0xFFFF7B00), const Color(0xFFFF2600)],
              ),
              _buildFeatureCard(
                Icons.trending_up, 
                "Dashboard Intelligent", 
                "Visualisez vos KPI sur des graphiques interactifs",
                [const Color(0xFF00D2B8), const Color(0xFF00C6FB)],
              ),
              _buildFeatureCard(
                Icons.bolt, 
                "Recommandations IA", 
                "Suggestions personnalisées pour améliorer votre offre",
                [const Color(0xFFA93CFE), const Color(0xFF6B50FF)],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // === Content Generation Section ===
  Widget _buildContentGenerationSection() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      color: const Color(0xFFF9FBFF),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              "NOUVEAUTÉ", 
              style: TextStyle(
                color: AppColors.red,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            "Génération de Contenu\nAutomatisée",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w800,
              color: AppColors.black,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            "Notre IA crée pour vous :",
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 40),
          
          // Types de contenu
          Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children: [
              _buildContentType("Posts Réseaux Sociaux", Icons.facebook),
              _buildContentType("Emails Marketing", Icons.email),
              _buildContentType("Scripts Vidéo", Icons.videocam),
              _buildContentType("Articles de Blog", Icons.article),
              _buildContentType("Publicités", Icons.ads_click),
              _buildContentType("Réponses aux Avis", Icons.reply),
            ],
          ),
          const SizedBox(height: 40),
          
          // Exemple généré
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome, color: AppColors.blue, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      "EXEMPLE GÉNÉRÉ PAR L'IA",
                      style: TextStyle(
                        color: AppColors.blue,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  "🌟 Nouvelle Collection Printemps ! 🌟",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Découvrez nos produits phares cette saison... [texte généré à partir des avis clients positifs]",
                  style: TextStyle(
                    color: Colors.grey,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  children: [
                    Chip(
                      label: const Text("#ModePrintemps"),
                      backgroundColor: AppColors.blue.withOpacity(0.1),
                    ),
                    Chip(
                      label: const Text("#Nouveauté"),
                      backgroundColor: AppColors.red.withOpacity(0.1),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // === Dashboard Showcase ===
  Widget _buildDashboardShowcase() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Column(
        children: [
          const Text(
            "VOTRE TABLEAU DE BORD INTÉGRÉ",
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.blue,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Pilotez Votre Business\navec des Données Clairès",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: AppColors.black,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 40),
          
          // Mockup Dashboard
          Container(
            height: 400,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 30,
                  offset: const Offset(0, 20),
                ),
              ],
              image: const DecorationImage(
                image: AssetImage('assets/images/dashboard-mockup.png'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(height: 40),
          
          // Points clés
          Column(
            children: [
              _buildDashboardFeature("Analyse temporelle des sentiments"),
              _buildDashboardFeature("Alertes sur les tendances négatives"),
              _buildDashboardFeature("Suggestions de contenu contextuelles"),
              _buildDashboardFeature("Benchmark concurrentiel"),
            ],
          ),
        ],
      ),
    );
  }

  // === Testimonials ===
  Widget _buildTestimonials() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      color: const Color(0xFFF9FBFF),
      child: Column(
        children: [
          const Text(
            "ILS NOUS FONT CONFIANCE",
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.blue,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "Ce Que Disent Nos Clients",
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: AppColors.black,
            ),
          ),
          const SizedBox(height: 60),
          
          // Témoignages
          SizedBox(
            height: 320,
            child: PageView(
              children: [
                _buildTestimonialCard(
                  "MarketMind a transformé notre façon d'interagir avec nos clients. La génération automatique de contenu nous fait gagner 10h/semaine !",
                  "Marie Dubois",
                  "CEO @FashionLab",
                  Colors.blue.shade50,
                ),
                _buildTestimonialCard(
                  "Les analyses de sentiment nous ont permis de réduire de 30% notre taux de retour produits. Un must pour tout e-commerçant.",
                  "Jean Martin",
                  "Directeur Marketing @TechShop",
                  Colors.red.shade50,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // === Final CTA ===
  Widget _buildFinalCta() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.blue, AppColors.red],
        ),
      ),
      child: Column(
        children: [
          const Text(
            "Prêt à Révolutionner Votre Marketing ?",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            "Essayez MarketMind gratuitement pendant 14 jours. Aucune carte de crédit requise.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 40),
          _buildWhiteButton("Démarrer l'Essai Gratuit", Icons.arrow_forward),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () {},
            child: const Text(
              "Parler à un Expert",
              style: TextStyle(
                color: Colors.white,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // === Bottom Nav Bar ===
  Widget _buildBottomNavBar() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      onTap: (index) => setState(() => _currentIndex = index),
      selectedItemColor: AppColors.blue,
      unselectedItemColor: Colors.grey.shade500,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: "Accueil",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.analytics),
          label: "Dashboard",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.create),
          label: "Générer",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.settings),
          label: "Paramètres",
        ),
      ],
    );
  }

  // === Widgets Réutilisables ===

  Widget _buildGradientButton(String text, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Colors.white, Colors.white],
        ),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: () {},
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: AppColors.blue),
                const SizedBox(width: 8),
                Text(
                  text,
                  style: const TextStyle(
                    color: AppColors.blue,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWhiteOutlineButton(String text) {
    return OutlinedButton(
      onPressed: () {},
      style: OutlinedButton.styleFrom(
        side: const BorderSide(width: 2, color: Colors.white),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String title, String subtitle, List<Color> gradientColors) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Material(
          color: Colors.white,
          child: InkWell(
            onTap: () {},
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: gradientColors,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: Colors.white, size: 24),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Text(
                        "En savoir plus",
                        style: TextStyle(
                          fontSize: 14,
                          color: gradientColors[0],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(Icons.arrow_forward, size: 16, color: gradientColors[0]),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContentType(String label, IconData icon) {
    return Container(
      width: 160,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.blue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.blue),
          ),
          const SizedBox(height: 12),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardFeature(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: AppColors.blue),
          const SizedBox(width: 12),
          Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTestimonialCard(String text, String name, String position, Color bgColor) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.format_quote, size: 36, color: AppColors.blue.withOpacity(0.3)),
          const SizedBox(height: 20),
          Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontStyle: FontStyle.italic,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          CircleAvatar(
            radius: 24,
            backgroundColor: Colors.grey.shade200,
            child: const Icon(Icons.person, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            name,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            position,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWhiteButton(String text, IconData icon) {
    return ElevatedButton.icon(
      onPressed: () {},
      icon: Icon(icon, size: 20),
      label: Text(text),
      style: ElevatedButton.styleFrom(
        foregroundColor: AppColors.blue, backgroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 4,
        textStyle: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
      ),
    );
  }
}