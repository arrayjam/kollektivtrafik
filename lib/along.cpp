#include <math.h>
#include <stdio.h>

struct point
{
    double Lon;
    double Lat;
};

point
Point(double Lon, double Lat)
{
    point Point = {Lon, Lat};

    return Point;
}

double
ToRadian(double Degree)
{
    double Result = Degree * M_PI / 180;

    return Result;
}

double
ToDegree(double Radian)
{
    double Result = Radian * 180 / M_PI;

    return Result;
}

double
DistanceBetweenPoints(point PointA, point PointB)
{
    double Result = 0;

    double DeltaLat = ToRadian(PointB.Lat - PointA.Lat);
    double DeltaLon = ToRadian(PointB.Lon - PointA.Lon);
    double Lat1 = ToRadian(PointA.Lat);
    double Lat2 = ToRadian(PointB.Lat);

    double DeltaLatOver2Sin = sin(DeltaLat / 2);
    double DeltaLonOver2Sin = sin(DeltaLon / 2);

    double A = ((DeltaLatOver2Sin * DeltaLatOver2Sin) +
                (DeltaLonOver2Sin * DeltaLonOver2Sin * cos(Lat1) * cos(Lat2)));

    double C = 2 * atan2(sqrt(A), sqrt(1 - A));

    double RadianToMeters = 6371000;

    Result = RadianToMeters * C;

    return Result;
}

double
BearingBetweenPoints(point PointA, point PointB)
{
    double Lon1 = ToRadian(PointA.Lon);
    double Lon2 = ToRadian(PointB.Lon);
    double Lat1 = ToRadian(PointA.Lat);
    double Lat2 = ToRadian(PointB.Lat);

    double A = sin(Lon2 - Lon1) * cos(Lat2);
    double B = ((cos(Lat1) * sin(Lat2)) -
                (sin(Lat1) * cos(Lat2) * cos(Lon2 - Lon1)));

    double Bearing = ToDegree(atan2(A, B));

    return Bearing;
}


int
main(int argc, char **argv)
{
    point PointA = Point(39.984, -75.343);
    point PointB = Point(39.123, -75.534);

    double Distance = DistanceBetweenPoints(PointA, PointB);
    printf("Distance is: %f\n", Distance);

    double Bearing = BearingBetweenPoints(PointA, PointB);
    printf("Bearing is: %f\n", Bearing);

    return 0;
}
