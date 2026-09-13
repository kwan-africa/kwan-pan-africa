import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  static const _tabs = [
    _Tab(icon: Icons.explore_outlined, activeIcon: Icons.explore, label: 'Discover', route: AppRoutes.discover),
    _Tab(icon: Icons.record_voice_over_outlined, activeIcon: Icons.record_voice_over, label: 'Dialect', route: AppRoutes.dialect),
    _Tab(icon: Icons.directions_bus_outlined, activeIcon: Icons.directions_bus, label: 'Transit', route: AppRoutes.transit),
  ];

  String _currentTab(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    if (loc.startsWith(AppRoutes.dialect)) return AppRoutes.dialect;
    if (loc.startsWith(AppRoutes.transit)) return AppRoutes.transit;
    return AppRoutes.discover;
  }

  @override
  Widget build(BuildContext context) {
    final current = _currentTab(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          border: const Border(top: BorderSide(color: AppTheme.border)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60,
            child: Row(
              children: _tabs.map((tab) {
                final active = current == tab.route;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => context.go(tab.route),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 200),
                          child: Icon(
                            active ? tab.activeIcon : tab.icon,
                            key: ValueKey(active),
                            color: active ? AppTheme.primary : AppTheme.textMuted,
                            size: 22,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(tab.label,
                            style: TextStyle(
                                fontFamily: 'Outfit',
                                fontSize: 10,
                                fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                                color: active ? AppTheme.primary : AppTheme.textMuted)),
                        if (active)
                          Container(
                            margin: const EdgeInsets.only(top: 3),
                            width: 4, height: 4,
                            decoration: const BoxDecoration(
                                color: AppTheme.primary, shape: BoxShape.circle),
                          ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _Tab {
  final IconData icon, activeIcon;
  final String label, route;
  const _Tab({required this.icon, required this.activeIcon,
      required this.label, required this.route});
}
