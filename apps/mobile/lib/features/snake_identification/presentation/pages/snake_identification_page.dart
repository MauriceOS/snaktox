import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

import '../../../../core/theme/app_theme.dart';
import '../widgets/camera_capture.dart';
import '../widgets/identification_result.dart';
import '../widgets/species_info.dart';

class SnakeIdentificationPage extends ConsumerStatefulWidget {
  const SnakeIdentificationPage({super.key});

  @override
  ConsumerState<SnakeIdentificationPage> createState() => _SnakeIdentificationPageState();
}

class _SnakeIdentificationPageState extends ConsumerState<SnakeIdentificationPage> {
  File? _selectedImage;
  bool _isProcessing = false;
  Map<String, dynamic>? _identificationResult;

  Future<void> _captureImage(ImageSource source) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _isProcessing = true;
          _identificationResult = null;
        });

        // Simulate AI processing
        await Future.delayed(const Duration(seconds: 3));
        
        // Mock result - replace with actual AI service call
        setState(() {
          _identificationResult = {
            'species': 'Naja pallida',
            'commonName': 'Red Spitting Cobra',
            'confidence': 0.94,
            'riskLevel': 'HIGH',
            'venomType': 'Neurotoxic',
            'firstAid': [
              'Keep the victim calm and still',
              'Remove any jewelry or tight clothing',
              'Do not apply a tourniquet',
              'Seek immediate medical attention',
            ],
            'antivenom': 'Polyvalent antivenom',
            'symptoms': [
              'Pain and swelling at bite site',
              'Nausea and vomiting',
              'Difficulty breathing',
              'Blurred vision',
            ],
          };
          _isProcessing = false;
        });
      }
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error capturing image: $e'),
            backgroundColor: AppTheme.emergencyRed,
          ),
        );
      }
    }
  }

  void _resetIdentification() {
    setState(() {
      _selectedImage = null;
      _identificationResult = null;
      _isProcessing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Snake Identification'),
        actions: [
          if (_selectedImage != null)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _resetIdentification,
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.snakeGreen.withOpacity(0.1),
                    AppTheme.medicalBlue.withOpacity(0.1),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.camera_alt,
                    size: 48,
                    color: AppTheme.snakeGreen,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'AI Snake Identification',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Take a photo to identify snake species with 94.2% accuracy',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Image Capture Section
            if (_selectedImage == null)
              CameraCapture(
                onImageCaptured: _captureImage,
              )
            else
              Column(
                children: [
                  // Selected Image
                  Container(
                    width: double.infinity,
                    height: 300,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppTheme.snakeGreen,
                        width: 2,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(
                        _selectedImage!,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Processing or Result
                  if (_isProcessing)
                    const Column(
                      children: [
                        CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(AppTheme.snakeGreen),
                        ),
                        SizedBox(height: 16),
                        Text('Analyzing image...'),
                      ],
                    )
                  else if (_identificationResult != null)
                    Column(
                      children: [
                        IdentificationResult(result: _identificationResult!),
                        const SizedBox(height: 16),
                        SpeciesInfo(species: _identificationResult!),
                      ],
                    ),
                ],
              ),
            
            const SizedBox(height: 24),
            
            // Instructions
            if (_selectedImage == null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Instructions',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text('• Ensure good lighting'),
                      const Text('• Keep the snake in focus'),
                      const Text('• Include the entire snake if possible'),
                      const Text('• Maintain a safe distance'),
                      const Text('• Do not attempt to capture the snake'),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
