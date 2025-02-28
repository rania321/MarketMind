import 'package:flutter/material.dart';

class ContentPage extends StatelessWidget {
  const ContentPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Contenu Généré',
            style: TextStyle(
              fontSize: 24.0,
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
          const SizedBox(height: 20.0),
          ListTile(
            leading: Icon(Icons.article, color: Colors.red),
            title: Text('Article 1'),
            subtitle: Text('Date: 01/01/2023'),
          ),
          ListTile(
            leading: Icon(Icons.article, color: Colors.red),
            title: Text('Article 2'),
            subtitle: Text('Date: 02/01/2023'),
          ),
        ],
      ),
    );
  }
}