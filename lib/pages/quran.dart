import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../theme.dart';

class QuranPage extends StatelessWidget {
  const QuranPage({super.key});
  Future<List> load() async {
    final r = await http.get(Uri.parse('https://api.alquran.cloud/v1/surah'));
    return jsonDecode(utf8.decode(r.bodyBytes))['data'];
  }
  @override
  Widget build(BuildContext c) => FutureBuilder<List>(future: load(), builder: (c, s) {
    if (s.hasError) return const Center(child: Text('تعذر التحميل'));
    if (!s.hasData) return const Center(child: CircularProgressIndicator());
    return ListView(padding: const EdgeInsets.all(16), children: [
      for (final x in s.data!) Card(child: ListTile(
        leading: Text('${x['number']}', style: const TextStyle(color: C.gold, fontSize: 18)),
        title: Text(x['name'], style: quranStyle(22)),
        subtitle: Text('${x['numberOfAyahs']} آية'),
        onTap: () {/* المرحلة التالية: فتح صفحة المصحف PageView */}))]);
  });
}
