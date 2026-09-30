import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';

class AzkarPage extends StatelessWidget {
  const AzkarPage({super.key});
  Future<List> load() async => jsonDecode(await rootBundle.loadString('assets/azkar.json'));
  static const icons = [Icons.wb_sunny_rounded, Icons.nightlight_round, Icons.bedtime_rounded, Icons.mosque_rounded];
  @override
  Widget build(BuildContext c) => FutureBuilder<List>(future: load(), builder: (c, s) {
    if (!s.hasData) return const Center(child: CircularProgressIndicator(color: C.gold));
    final g = s.data!;
    return ListView(padding: const EdgeInsets.fromLTRB(18, 14, 18, 24), children: [
      Text('الأذكار', style: Theme.of(c).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
      const SizedBox(height: 16),
      GridView.count(crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.05, children: [
        for (int i = 0; i < g.length; i++) GestureDetector(
          onTap: () => Navigator.push(c, MaterialPageRoute(builder: (_) => _Group(g[i]))),
          child: PatternBox(pad: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icons[i % icons.length], color: C.gold, size: 30), const Spacer(),
            Text(g[i]['cat'], style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700)),
            Text('${(g[i]['items'] as List).length} ذكر', style: const TextStyle(color: C.mute, fontSize: 13))])))])]);
  });
}

class _Group extends StatelessWidget {
  final Map g; const _Group(this.g);
  @override
  Widget build(BuildContext c) => Scaffold(appBar: AppBar(title: Text(g['cat'])),
    body: ListView(padding: const EdgeInsets.all(16), children: [for (final i in g['items']) _Counter(i['t'], i['n'])]));
}

class _Counter extends StatefulWidget { final String t; final int n; const _Counter(this.t, this.n); @override State<_Counter> createState() => _CS(); }
class _CS extends State<_Counter> {
  late int left = widget.n;
  @override
  Widget build(BuildContext c) => Container(margin: const EdgeInsets.only(bottom: 14), padding: const EdgeInsets.all(20), decoration: cardBox(),
    child: Column(children: [
      Text(widget.t, textAlign: TextAlign.center, style: quranStyle(23)),
      const SizedBox(height: 14),
      GestureDetector(onTap: () { if (left > 0) { HapticFeedback.lightImpact(); setState(() => left--); } },
        child: SizedBox(width: 78, height: 78, child: Stack(alignment: Alignment.center, children: [
          SizedBox.expand(child: CircularProgressIndicator(value: 1 - left / widget.n, strokeWidth: 4, color: C.gold, backgroundColor: C.line)),
          left == 0 ? const Icon(Icons.check_rounded, color: C.gold, size: 32)
                    : Text('$left', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700))])))]));
}
