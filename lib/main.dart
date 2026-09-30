import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'theme.dart';
import 'pages/home.dart';
import 'pages/azkar.dart';
import 'pages/radio.dart';
import 'pages/quran.dart';
import 'pages/settings.dart';

void main() => runApp(const NoorApp());

class NoorApp extends StatelessWidget {
  const NoorApp({super.key});
  @override
  Widget build(BuildContext c) => MaterialApp(
    title: 'نور', debugShowCheckedModeBanner: false, theme: buildTheme(),
    locale: const Locale('ar'), supportedLocales: const [Locale('ar')],
    localizationsDelegates: const [GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate, GlobalCupertinoLocalizations.delegate],
    home: const Shell());
}

class Shell extends StatefulWidget { const Shell({super.key}); @override State<Shell> createState() => _S(); }
class _S extends State<Shell> {
  int i = 0;
  static const pages = [HomePage(), AzkarPage(), RadioPage(), QuranPage(), SettingsPage()];
  @override
  Widget build(BuildContext c) => Scaffold(
    body: SafeArea(child: IndexedStack(index: i, children: pages)),
    bottomNavigationBar: NavigationBar(selectedIndex: i, onDestinationSelected: (v) => setState(() => i = v),
      destinations: const [
        NavigationDestination(icon: Icon(Icons.access_time), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.auto_awesome), label: 'الأذكار'),
        NavigationDestination(icon: Icon(Icons.radio), label: 'الراديو'),
        NavigationDestination(icon: Icon(Icons.menu_book), label: 'القرآن'),
        NavigationDestination(icon: Icon(Icons.person_outline), label: 'حسابي'),
      ]));
}
