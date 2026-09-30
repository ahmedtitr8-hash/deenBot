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
  static const nav = [
    (Icons.mosque_rounded, 'الرئيسية'), (Icons.auto_awesome_rounded, 'الأذكار'),
    (Icons.graphic_eq_rounded, 'الراديو'), (Icons.menu_book_rounded, 'القرآن'), (Icons.person_rounded, 'حسابي')];
  @override
  Widget build(BuildContext c) => Scaffold(
    body: SafeArea(bottom: false, child: IndexedStack(index: i, children: pages)),
    bottomNavigationBar: SafeArea(child: Container(
      margin: const EdgeInsets.fromLTRB(14, 0, 14, 10), padding: const EdgeInsets.all(6),
      decoration: cardBox().copyWith(borderRadius: BorderRadius.circular(30)),
      child: Row(children: [for (int k = 0; k < nav.length; k++) Expanded(child: GestureDetector(
        behavior: HitTestBehavior.opaque, onTap: () => setState(() => i = k),
        child: AnimatedContainer(duration: const Duration(milliseconds: 220), curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(color: i == k ? C.gold.withOpacity(.16) : Colors.transparent, borderRadius: BorderRadius.circular(24)),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(nav[k].$1, size: 24, color: i == k ? C.gold : C.mute),
            const SizedBox(height: 3),
            Text(nav[k].$2, style: TextStyle(fontSize: 11, color: i == k ? C.gold : C.mute))]))))])))
  );
}
