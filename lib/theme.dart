import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class C {
  static const ink = Color(0xFF0E1A2B), panel = Color(0xFF16263C);
  static const sand = Color(0xFFF2E8D5), gold = Color(0xFFC9A45C);
  static const lapis = Color(0xFF2F5D8A);
}

ThemeData buildTheme() {
  final base = ThemeData(brightness: Brightness.dark, useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: C.lapis, brightness: Brightness.dark, surface: C.ink));
  return base.copyWith(
    scaffoldBackgroundColor: C.ink,
    textTheme: GoogleFonts.tajawalTextTheme(base.textTheme).apply(bodyColor: C.sand, displayColor: C.sand),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: C.panel, indicatorColor: C.gold.withOpacity(.2),
      labelTextStyle: WidgetStatePropertyAll(GoogleFonts.tajawal(fontSize: 12, color: C.sand))),
    cardTheme: CardTheme(color: C.panel, elevation: 0, margin: const EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
  );
}
TextStyle quranStyle(double s) => GoogleFonts.amiriQuran(fontSize: s, height: 2, color: C.sand);
