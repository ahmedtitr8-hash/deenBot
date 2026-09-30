import 'dart:async';
import 'package:adhan_dart/adhan_dart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme.dart';

const cities = {
  'مكة المكرمة': [21.4225, 39.8262], 'المدينة المنورة': [24.4672, 39.6024],
  'الرياض': [24.7136, 46.6753], 'جدة': [21.4858, 39.1925], 'القاهرة': [30.0444, 31.2357],
  'دبي': [25.2048, 55.2708], 'الكويت': [29.3759, 47.9774], 'عمّان': [31.9454, 35.9284],
};

class HomePage extends StatefulWidget { const HomePage({super.key}); @override State<HomePage> createState() => _H(); }
class _H extends State<HomePage> {
  String city = 'مكة المكرمة'; DateTime now = DateTime.now(); Timer? tm;
  @override
  void initState() { super.initState(); tm = Timer.periodic(const Duration(seconds: 1), (_) => setState(() => now = DateTime.now())); }
  @override
  void dispose() { tm?.cancel(); super.dispose(); }

  List<(String, DateTime)> day(DateTime d) {
    final l = cities[city]!;
    final t = PrayerTimes(coordinates: Coordinates(l[0], l[1]), date: d, calculationParameters: CalculationMethodParameters.ummAlQura());
    return [('الفجر', t.fajr!.toLocal()), ('الشروق', t.sunrise!.toLocal()), ('الظهر', t.dhuhr!.toLocal()),
            ('العصر', t.asr!.toLocal()), ('المغرب', t.maghrib!.toLocal()), ('العشاء', t.isha!.toLocal())];
  }
  String two(int n) => n.toString().padLeft(2, '0');

  void pickCity() => showModalBottomSheet(context: context, backgroundColor: C.panel,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
    builder: (_) => ListView(padding: const EdgeInsets.all(12), children: [
      for (final k in cities.keys) ListTile(title: Text(k, style: const TextStyle(fontSize: 18)),
        trailing: k == city ? const Icon(Icons.check_circle, color: C.gold) : null,
        onTap: () { setState(() => city = k); Navigator.pop(context); })]));

  @override
  Widget build(BuildContext c) {
    final today = day(now);
    var next = today.indexWhere((e) => e.$2.isAfter(now));
    final nextTime = next == -1 ? day(now.add(const Duration(days: 1)))[0].$2 : today[next].$2;
    final nextName = next == -1 ? 'الفجر' : today[next].$1;
    final d = nextTime.difference(now);
    final f = DateFormat.jm('ar');
    return ListView(padding: const EdgeInsets.fromLTRB(18, 14, 18, 24), children: [
      Row(children: [
        Expanded(child: Text('السلام عليكم', style: Theme.of(c).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700))),
        GestureDetector(onTap: pickCity, child: Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          decoration: cardBox(), child: Row(children: [
            const Icon(Icons.location_on_rounded, size: 18, color: C.gold), const SizedBox(width: 6),
            Text(city), const Icon(Icons.expand_more, size: 18, color: C.mute)])))]),
      const SizedBox(height: 18),
      PatternBox(child: SizedBox(width: double.infinity, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('الصلاة القادمة', style: TextStyle(color: C.mute, fontSize: 14)),
        const SizedBox(height: 4),
        Text(nextName, style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w800, height: 1.2)),
        const SizedBox(height: 10),
        Text('${two(d.inHours)}:${two(d.inMinutes % 60)}:${two(d.inSeconds % 60)}',
          style: const TextStyle(fontSize: 38, color: C.gold, fontWeight: FontWeight.w600,
            fontFeatures: [FontFeature.tabularFigures()], letterSpacing: 1)),
        const SizedBox(height: 6),
        Text('عند ${f.format(nextTime)}', style: const TextStyle(color: C.mute))]))),
      const SizedBox(height: 22),
      for (int k = 0; k < today.length; k++) Builder(builder: (_) {
        final isNext = today[k].$1 == nextName && next != -1, past = today[k].$2.isBefore(now);
        return Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          decoration: cardBox(isNext ? C.gold.withOpacity(.10) : null).copyWith(
            border: Border.all(color: isNext ? C.gold : C.line)),
          child: Row(children: [
            Icon(past ? Icons.check_circle_rounded : Icons.circle_outlined, size: 20, color: past ? C.lapis : C.mute),
            const SizedBox(width: 14),
            Expanded(child: Text(today[k].$1, style: TextStyle(fontSize: 19, color: past ? C.mute : C.sand))),
            Text(f.format(today[k].$2), style: TextStyle(fontSize: 19, color: isNext ? C.gold : (past ? C.mute : C.sand)))]));
      })]);
  }
}
