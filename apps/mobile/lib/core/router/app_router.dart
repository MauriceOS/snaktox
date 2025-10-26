import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/home/presentation/pages/home_page.dart';
import '../../features/emergency/presentation/pages/emergency_page.dart';
import '../../features/snake_identification/presentation/pages/snake_identification_page.dart';
import '../../features/hospitals/presentation/pages/hospitals_page.dart';
import '../../features/education/presentation/pages/education_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      
      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      
      // Authentication
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Main App with Bottom Navigation
      ShellRoute(
        builder: (context, state, child) {
          return MainShell(child: child);
        },
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/emergency',
            name: 'emergency',
            builder: (context, state) => const EmergencyPage(),
          ),
          GoRoute(
            path: '/snake-identification',
            name: 'snake-identification',
            builder: (context, state) => const SnakeIdentificationPage(),
          ),
          GoRoute(
            path: '/hospitals',
            name: 'hospitals',
            builder: (context, state) => const HospitalsPage(),
          ),
          GoRoute(
            path: '/education',
            name: 'education',
            builder: (context, state) => const EducationPage(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you are looking for does not exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

class MainShell extends StatefulWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<NavigationItem> _navigationItems = [
    NavigationItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Home',
      route: '/home',
    ),
    NavigationItem(
      icon: Icons.emergency_outlined,
      activeIcon: Icons.emergency,
      label: 'Emergency',
      route: '/emergency',
    ),
    NavigationItem(
      icon: Icons.camera_alt_outlined,
      activeIcon: Icons.camera_alt,
      label: 'Snake ID',
      route: '/snake-identification',
    ),
    NavigationItem(
      icon: Icons.local_hospital_outlined,
      activeIcon: Icons.local_hospital,
      label: 'Hospitals',
      route: '/hospitals',
    ),
    NavigationItem(
      icon: Icons.school_outlined,
      activeIcon: Icons.school,
      label: 'Education',
      route: '/education',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          context.go(_navigationItems[index].route);
        },
        items: _navigationItems.map((item) {
          final isActive = _currentIndex == _navigationItems.indexOf(item);
          return BottomNavigationBarItem(
            icon: Icon(
              isActive ? item.activeIcon : item.icon,
              color: isActive ? Theme.of(context).colorScheme.primary : null,
            ),
            label: item.label,
          );
        }).toList(),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;

  NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
  });
}
