import 'package:flutter/material.dart';
import 'package:front_mobile/constants/colors.dart';
import 'package:front_mobile/widgets/custom_app_bar.dart';
import 'package:front_mobile/widgets/custom_drawer.dart';
import 'package:front_mobile/widgets/custom_navigation_bar.dart';
import 'package:image_picker/image_picker.dart'; // Pour la sélection d'images
import 'dart:io';

class ProductScreen extends StatefulWidget {
  const ProductScreen({Key? key}) : super(key: key);

  @override
  _ProductScreenState createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  int _currentIndex = 1;
  final _formKey = GlobalKey<FormState>();
  File? _selectedImage;
  final ImagePicker _picker = ImagePicker();

  // Contrôleurs pour le formulaire
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _categoryController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _stockController = TextEditingController();

  final List<Map<String, dynamic>> _products = [
    {
      'name': 'Smartphone X',
      'category': 'Électronique',
      'description': 'Dernier modèle avec écran AMOLED et triple caméra',
      'price': '799.99',
      'stock': '45',
      'image': 'assets/images/product1.jpg',
      'rating': 4.5,
    },
    {
      'name': 'Chemise en coton',
      'category': 'Vêtements',
      'description': 'Chemise 100% coton, disponible en plusieurs couleurs',
      'price': '49.99',
      'stock': '120',
      'image': 'assets/images/product2.jpg',
      'rating': 4.2,
    },
  ];

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  void _addProduct() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _products.add({
          'name': _nameController.text,
          'category': _categoryController.text,
          'description': _descriptionController.text,
          'price': _priceController.text,
          'stock': _stockController.text,
          'image': _selectedImage != null ? _selectedImage!.path : 'assets/images/default_product.png',
          'rating': 0.0,
        });
        
        // Réinitialiser le formulaire
        _nameController.clear();
        _categoryController.clear();
        _descriptionController.clear();
        _priceController.clear();
        _stockController.clear();
        _selectedImage = null;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Produit ajouté avec succès!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _deleteProduct(int index) {
    setState(() {
      _products.removeAt(index);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Produit supprimé'),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _categoryController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: "Gestion des Produits",
        showNotificationIcon: true,
        onNotificationPressed: () {},
      ),
      drawer: CustomDrawer(),
      backgroundColor: Colors.grey[50],
      body: Column(
        children: [
          // Section d'ajout de produit
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ajouter un nouveau produit',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.blue,
                    ),
                  ),
                  SizedBox(height: 20),
                  _buildProductForm(),
                  SizedBox(height: 30),
                  _buildProductList(),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: CustomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }

  Widget _buildProductForm() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Section image
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  height: 150,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: _selectedImage == null
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_a_photo, size: 40, color: Colors.grey[500]),
                            SizedBox(height: 8),
                            Text('Ajouter une image', style: TextStyle(color: Colors.grey[600])),
                          ],
                        )
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(_selectedImage!, fit: BoxFit.cover),
                        ),
                ),
              ),
              SizedBox(height: 20),

              // Champs du formulaire
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Nom du produit',
                  prefixIcon: Icon(Icons.shopping_bag),
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Ce champ est requis' : null,
              ),
              SizedBox(height: 15),

              TextFormField(
                controller: _categoryController,
                decoration: InputDecoration(
                  labelText: 'Catégorie',
                  prefixIcon: Icon(Icons.category),
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Ce champ est requis' : null,
              ),
              SizedBox(height: 15),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _priceController,
                      decoration: InputDecoration(
                        labelText: 'Prix',
                        prefixIcon: Icon(Icons.attach_money),
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.numberWithOptions(decimal: true),
                      validator: (value) => value!.isEmpty ? 'Ce champ est requis' : null,
                    ),
                  ),
                  SizedBox(width: 15),
                  Expanded(
                    child: TextFormField(
                      controller: _stockController,
                      decoration: InputDecoration(
                        labelText: 'Stock',
                        prefixIcon: Icon(Icons.inventory),
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) => value!.isEmpty ? 'Ce champ est requis' : null,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 15),

              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description',
                  prefixIcon: Icon(Icons.description),
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) => value!.isEmpty ? 'Ce champ est requis' : null,
              ),
              SizedBox(height: 20),

              // Bouton d'ajout
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _addProduct,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.blue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'AJOUTER LE PRODUIT',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Liste des produits',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.blue,
          ),
        ),
        SizedBox(height: 15),
        GridView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
            crossAxisSpacing: 15,
            mainAxisSpacing: 15,
            childAspectRatio: 0.75,
          ),
          itemCount: _products.length,
          itemBuilder: (context, index) {
            return _buildProductItem(index);
          },
        ),
      ],
    );
  }

  Widget _buildProductItem(int index) {
    final product = _products[index];
    final isImageAsset = product['image'].startsWith('assets/');

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image du produit
              ClipRRect(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                child: Container(
                  height: 120,
                  width: double.infinity,
                  color: Colors.grey[200],
                  child: isImageAsset
                      ? Image.asset(
                          product['image'],
                          fit: BoxFit.cover,
                        )
                      : Image.file(
                          File(product['image']),
                          fit: BoxFit.cover,
                        ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Nom et catégorie
                    Text(
                      product['name'],
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4),
                    Text(
                      product['category'],
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                    ),
                    SizedBox(height: 8),

                    // Prix et stock
                    Row(
                      children: [
                        Text(
                          '${product['price']} €',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.blue,
                          ),
                        ),
                        Spacer(),
                        Text(
                          'Stock: ${product['stock']}',
                          style: TextStyle(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),

                    // Note (étoiles)
                    Row(
                      children: [
                        Icon(Icons.star, color: Colors.amber, size: 16),
                        SizedBox(width: 4),
                        Text(
                          product['rating'].toString(),
                          style: TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Bouton de suppression
          Positioned(
            top: 8,
            right: 8,
            child: GestureDetector(
              onTap: () => _deleteProduct(index),
              child: Container(
                padding: EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.9),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.close, color: Colors.white, size: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}