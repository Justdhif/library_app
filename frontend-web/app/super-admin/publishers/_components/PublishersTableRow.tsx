'use client';

import { Publisher } from '@/lib/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Edit, 
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

interface PublishersTableRowProps {
  publisher: Publisher;
  onDelete: (publisher: Publisher) => void;
}

export function PublishersTableRow({ publisher, onDelete }: PublishersTableRowProps) {
  return (
    <Card className="hover:shadow-lg transition-all hover:border-emerald-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-1 mb-1">
                {publisher.name}
              </h3>
              {publisher.is_active ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          {publisher.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{publisher.email}</span>
            </div>
          )}
          {publisher.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{publisher.phone}</span>
            </div>
          )}
          {publisher.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1 truncate">{publisher.website}</span>
            </div>
          )}
          {(publisher.city || publisher.country) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {[publisher.city, publisher.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {publisher.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
            {publisher.description}
          </p>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Link href={`/publishers/${publisher.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(publisher)}
            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
