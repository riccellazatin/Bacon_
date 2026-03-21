from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as http_status
from .models import Items

# Static items catalog with point costs
items = [
	{
		'_id': '1',
		'name': 'ZUS Caramel Macchiato',
		'image': './images/ZUS_CarMac.png',
		'description': 'A multilayered masterpiece of sweetness.',
		'points': 35,
	},

	{
		'_id': '2',
		'name': 'ZUS Americano',
		'image': './images/ZUS_Amer.png',
		'description': 'The pure essence of specialty coffee.',
		'points': 30,
	},

	{
		'_id': '3',
		'name': 'ZUS Salted Caramel Latte',
		'image': './images/ZUS_CarLatte.png',
		'description': 'The perfect harmony of sweet and savory.',
		'points': 35,
	},

	{
		'_id': '4',
		'name': 'CHOWKING Buchi',
		'image': './images/CHOWKING_Buchi.png',
		'description': 'A sweet, golden finish to every meal.',
		'points': 25,
	},

	{
		'_id': '5',
		'name': 'CHOWKING Chicharap',
		'image': './images/CHOWKING_Chi.png',
		'description': 'Crunch in every bite.',
		'points': 15,
	},

	{
		'_id': '6',
		'name': 'CHOWKING Halo-Halo',
		'image': './images/CHOWKING_Halo.png',
		'description': 'The ultimate Filipino dessert experience.',
		'points': 40,
	},

	{
		'_id': '7',
		'name': 'JOLLIBEE Chocolate Sundae',
		'image': './images/JOLLIBEE_ChocSun.png',
		'description': 'A classic swirl of pure joy.',
		'points': 25,
	},

	{
		'_id': '8',
		'name': 'JOLLIBEE Fries',
		'image': './images/JOLLIBEE_Fries.png',
		'description': 'Golden, crunchy, and seasoned to perfection.',
		'points': 25,
	},

	{
		'_id': '9',
		'name': 'JOLLIBEE Peach Mango Pie',
		'image': './images/JOLLIBEE_Peach.png',
		'description': 'A warm, golden pocket of tropical bliss.',
		'points': 30,
	},

	{
		'_id': '10',
		'name': 'GRABGIFTS ₱200 Gift Card',
		'image': './images/GRAB_200.png',
		'description': 'Your all-access pass to the Grab ecosystem.',
		'points': 40,
	},

	{
		'_id': '11',
		'name': 'LAZADA ₱200 Gift Card',
		'image': './images/LAZADA_200.png',
		'description': 'Unlock a world of endless shopping possibilities.',
		'points': 40,
	},

	{
		'_id': '12',
		'name': 'SHOPEE ₱200 Gift Card',
		'image': './images/SHOPEE_200.png',
		'description': 'Your key to a seamless shopping spree.',
		'points': 40,
	},

]

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'api/items/',
        'api/items/<id>/',
        'api/items/<id>/purchase/',
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchaseItem(request, pk):
    """Purchase a shop item using the user's points"""
    item = None
    for i in items:
        if i['_id'] == pk:
            item = i
            break
    
    if not item:
        return Response(
            {'detail': 'Item not found'},
            status=http_status.HTTP_404_NOT_FOUND
        )
    
    user = request.user
    item_points = item.get('points', 0)
    
    # Check if user has enough points
    if user.total_points < item_points:
        return Response(
            {
                'detail': f'Insufficient points. You have {user.total_points} points but need {item_points}.',
                'total_points': user.total_points,
                'points_needed': item_points - user.total_points
            },
            status=http_status.HTTP_400_BAD_REQUEST
        )
    
    # Deduct points from user
    user.total_points -= item_points
    user.save()
    
    # Create a purchase record
    Items.objects.create(
        user=user,
        name=item['name'],
        description=item['description'],
        image=item['image'],
        points=item_points,
        is_paid=True
    )
    
    return Response(
        {
            'detail': f'Successfully purchased {item["name"]}!',
            'item': item,
            'total_points': user.total_points,
            'points_spent': item_points
        },
        status=http_status.HTTP_200_OK
    )