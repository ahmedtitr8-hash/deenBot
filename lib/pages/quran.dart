import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../theme.dart';

class QuranPage extends StatefulWidget { const QuranPage({super.key}); @override State<QuranPage> createState() => _Q(); }
class _Q extends State<QuranPage> {
  late final Future<List> f = load(); String q = '';
  Future<List> load() async {
    final r = await http.get(Uri.parse('https://api.alquran.cloud/v1/surah'));
    return jsonDecode(utf8.decode(r.bodyBytes))['data'];
  }
  @override
  Widget build(BuildContext c) => FutureBuilder<List>(future: f, builder: (c, s) {
    if (s.hasError) return const Center(child: Text('تعذر التحميل. تأكد من الاتصال بالإنترنت'));
    if (!s.hasData) return const Center(child: CircularProgressIndicator(color: C.gold));
    final list = s.data!.where((x) => x['name'].toString().contains(q) || '${x['number']}' == q).toList();
    return ListView(padding: const EdgeInsets.fromLTRB(18, 14, 18, 24), children: [
      Text('فهرس القرآن', style: Theme.of(c).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
      const SizedBox(height: 14),
      TextField(onChanged: (v) => setState(() => q = v), decoration: InputDecoration(hintText: 'ابحث باسم السورة أو رقمها',
        prefixIcon: const Icon(Icons.search, color: C.mute), filled: true, fillColor: C.panel,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none))),
      const SizedBox(height: 12),
      for (final x in list) Container(margin: const EdgeInsets.only(bottom: 10), decoration: cardBox(),
        child: ListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          leading: StarBadge('${x['number']}'),
          title: Text(x['name'], style: quranStyle(22).copyWith(height: 1.6)),
          subtitle: Text('${x['revelationType'] == 'Meccan' ? 'مكية' : 'مدنية'} • ${x['numberOfAyahs']} آية', style: const TextStyle(color: C.mute)),
          onTap: () {/* المرحلة القادمة: صفحات المصحف */}))]);
  });
}
