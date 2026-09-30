import 'package:adhan_dart/adhan_dart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme.dart';

// مدن يدوية (تُوسَّع لاحقًا لقائمة كاملة لكل دولة)
const cities = {
  'مكة المكرمة': [21.4225, 39.8262], 'المدينة المنورة': [24.4672, 39.6024],
  'الرياض': [24.7136, 46.6753], 'القاهرة': [30.0444, 31.2357],
  'دبي': [25.2048, 55.2708], 'الكويت': [29.3759, 47.9774], 'عمّان': [31.9454, 35.9284],
};

class HomePage extends StatefulWidget { const HomePage({super.key}); @override State<HomePage> createState() => _H(); }
class _H extends State<HomePage> {
  String city = 'مكة المكرمة';
  PrayerTimes get times {
    final l = cities[city]!;
    final p = CalculationMethodParameters.ummAlQura();
    return PrayerTimes(coordinates: Coordinates(l[0], l[1]), date: DateTime.now(), calculationParameters: p);
  }
  @override
  Widget build(BuildContext c) {
    final t = times;
    final rows = [('الفجر', t.fajr), ('الشروق', t.sunrise), ('الظهر', t.dhuhr),
                  ('العصر', t.asr), ('المغرب', t.maghrib), ('العشاء', t.isha)];
    final f = DateFormat.jm('ar');
    return ListView(padding: const EdgeInsets.all(20), children: [
      DropdownButton<String>(value: city, isExpanded: true, underline: const SizedBox(),
        items: [for (final k in cities.keys) DropdownMenuItem(value: k, child: Text(k, style: const TextStyle(fontSize: 22)))],
        onChanged: (v) => setState(() => city = v!)),
      const SizedBox(height: 12),
      for (final r in rows) Card(child: ListTile(
        title: Text(r.$1, style: const TextStyle(fontSize: 20)),
        trailing: Text(f.format(r.$2!.toLocal()), style: const TextStyle(fontSize: 20, color: C.gold)))),
    ]);
  }
}
