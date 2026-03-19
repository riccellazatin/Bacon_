from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

items = [
	{
		'_id': '1',
		'name': 'ZUS Caramel Macchiato',
		'image': './images/ZUS_CarMac.png',
		'description': 'A multilayered masterpiece of sweetness.',
		'points': '35 points',
	},

	{
		'_id': '2',
		'name': 'ZUS Americano',
		'image': './images/ZUS_Amer.png',
		'description': 'The pure essence of specialty coffee.',
		'points': '30 points',
	},

	{
		'_id': '3',
		'name': 'ZUS Salted Caramel Latte',
		'image': './images/ZUS_CarLatte.png',
		'description': 'The perfect harmony of sweet and savory.',
		'points': '35 points',
	},

	{
		'_id': '4',
		'name': 'CHOWKING Buchi',
		'image': './images/CHOWKING_Buchi.png',
		'description': 'A sweet, golden finish to every meal.',
		'points': '25 points',
	},

	{
		'_id': '5',
		'name': 'CHOWKING Chicharap',
		'image': './images/CHOWKING_Chi.png',
		'description': 'Crunch in every bite.',
		'points': '15 points',
	},

	{
		'_id': '6',
		'name': 'CHOWKING Halo-Halo',
		'image': './images/CHOWKING_Halo.png',
		'description': 'The ultimate Filipino dessert experience.',
		'points': '40 points',
	},

	{
		'_id': '7',
		'name': 'JOLLIBEE Chocolate Sundae',
		'image': './images/JOLLIBEE_ChocSun.png',
		'description': 'A classic swirl of pure joy.',
		'points': '25 points',
	},

	{
		'_id': '8',
		'name': 'JOLLIBEE Fries',
		'image': './images/JOLLIBEE_Fries.png',
		'description': 'Golden, crunchy, and seasoned to perfection.',
		'points': '25 points',
	},

	{
		'_id': '9',
		'name': 'JOLLIBEE Peach Mango Pie',
		'image': './images/JOLLIBEE_Peach.png',
		'description': 'A warm, golden pocket of tropical bliss.',
		'points': '30 points',
	},

	{
		'_id': '10',
		'name': 'GRABGIFTS ₱200 Gift Card',
		'image': './images/GRAB_200.png',
		'description': 'Your all-access pass to the Grab ecosystem.',
		'points': '40 points',
	},

	{
		'_id': '11',
		'name': 'LAZADA ₱200 Gift Card',
		'image': './images/LAZADA_200.png',
		'description': 'Unlock a world of endless shopping possibilities.',
		'points': '40 points',
	},

	{
		'_id': '12',
		'name': 'SHOPEE ₱200 Gift Card',
		'image': './images/SHOPEE_200.png',
		'description': 'Your key to a seamless shopping spree.',
		'points': '40 points',
	},

]

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'api/items/',
        'api/items/<id>/',
    ]
    return Response(routes)

@api_view(['GET'])
def getItems(request):
    return Response(items)

@api_view(['GET'])
def getItem(request, pk):
    item = None
    for i in items:
        if i['_id'] == pk:
            item = i
            break
    return Response(item)