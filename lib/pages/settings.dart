import 'package:flutter/material.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});
  @override
  Widget build(BuildContext c) => ListView(padding: const EdgeInsets.all(16), children: const [
    Card(child: ListTile(leading: Icon(Icons.calculate), title: Text('طريقة حساب المواقيت'), subtitle: Text('أم القرى'))),
    Card(child: ListTile(leading: Icon(Icons.text_fields), title: Text('حجم الخط'))),
    Card(child: ListTile(leading: Icon(Icons.notifications), title: Text('التنبيهات والأذان'))),
    Card(child: ListTile(leading: Icon(Icons.person), title: Text('حسابي'), subtitle: Text('قريبًا'))),
  ]);
}
