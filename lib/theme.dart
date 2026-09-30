import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class C {
  static const ink = Color(0xFF0A121C), panel = Color(0xFF111D2C), line = Color(0xFF1E2E42);
  static const sand = Color(0xFFEFE6D2), mute = Color(0xFF8A97A8);
  static const gold = Color(0xFFC8A15A), lapis = Color(0xFF2F5D8A);
}

ThemeData buildTheme() {
  final base = ThemeData(brightness: Brightness.dark, useMaterial3: true, scaffoldBackgroundColor: C.ink);
  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(seedColor: C.gold, brightness: Brightness.dark, surface: C.ink),
    textTheme: GoogleFonts.tajawalTextTheme(base.textTheme).apply(bodyColor: C.sand, displayColor: C.sand),
    appBarTheme: const AppBarTheme(backgroundColor: C.ink, elevation: 0, scrolledUnderElevation: 0));
}

TextStyle quranStyle(double s) => GoogleFonts.amiriQuran(fontSize: s, height: 2, color: C.sand);
BoxDecoration cardBox([Color? c]) => BoxDecoration(color: c ?? C.panel,
  borderRadius: BorderRadius.circular(22), border: Border.all(color: C.line));

void drawStar(Canvas c, Offset o, double r, Paint p) {
  final path = Path();
  for (int i = 0; i < 16; i++) {
    final a = i * pi / 8 - pi / 2, rr = i.isEven ? r : r * .62;
    final pt = o + Offset(cos(a) * rr, sin(a) * rr);
    i == 0 ? path.moveTo(pt.dx, pt.dy) : path.lineTo(pt.dx, pt.dy);
  }
  c.drawPath(path..close(), p);
}

// نقش نجمة ثمانية متكرر
class PatternPainter extends CustomPainter {
  final Color color; final double step;
  PatternPainter(this.color, {this.step = 46});
  @override
  void paint(Canvas c, Size s) {
    final p = Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 1;
    for (double y = 0; y < s.height + step; y += step) {
      for (double x = 0; x < s.width + step; x += step) {
        drawStar(c, Offset(x, y), step * .4, p);
        drawStar(c, Offset(x + step / 2, y + step / 2), step * .16, p);
      }
    }
  }
  @override
  bool shouldRepaint(_) => false;
}

class _One extends CustomPainter {
  @override
  void paint(Canvas c, Size s) => drawStar(c, s.center(Offset.zero), s.width / 2 - 1,
    Paint()..color = C.gold..style = PaintingStyle.stroke..strokeWidth = 1.4);
  @override
  bool shouldRepaint(_) => false;
}

class StarBadge extends StatelessWidget {
  final String t; const StarBadge(this.t, {super.key});
  @override
  Widget build(BuildContext c) => SizedBox(width: 46, height: 46, child: CustomPaint(
    painter: _One(), child: Center(child: Text(t, style: const TextStyle(color: C.gold, fontSize: 14, fontWeight: FontWeight.w700)))));
}

class PatternBox extends StatelessWidget {
  final Widget child; final Gradient? gradient; final EdgeInsets pad;
  const PatternBox({super.key, required this.child, this.gradient, this.pad = const EdgeInsets.all(22)});
  @override
  Widget build(BuildContext c) => ClipRRect(borderRadius: BorderRadius.circular(28), child: Container(
    decoration: BoxDecoration(gradient: gradient ?? const LinearGradient(begin: Alignment.topRight, end: Alignment.bottomLeft,
      colors: [Color(0xFF1B3A5C), Color(0xFF0F2135)]), border: Border.all(color: C.line), borderRadius: BorderRadius.circular(28)),
    child: Stack(children: [
      Positioned.fill(child: CustomPaint(painter: PatternPainter(C.gold.withOpacity(.09)))),
      Padding(padding: pad, child: child)])));
}
